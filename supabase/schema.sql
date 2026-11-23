-- Viva Stil — schema gratuită pe Supabase (PostgreSQL)
-- Rulează în: Supabase Dashboard → SQL Editor → New query → Run
--
-- Conturi clienți + programări + reset parolă (OTP pe email via EmailJS pe frontend)

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Conturi
-- ---------------------------------------------------------------------------
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null unique,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists clients_phone_idx on public.clients (phone);
create index if not exists clients_email_idx on public.clients (email);

alter table public.clients enable row level security;
-- Acces doar prin RPC-uri (SECURITY DEFINER). Fără politici = niciun acces direct.

-- ---------------------------------------------------------------------------
-- Challenge-uri reset parolă
-- ---------------------------------------------------------------------------
create table if not exists public.password_reset_challenges (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.password_reset_challenges enable row level security;

-- ---------------------------------------------------------------------------
-- Programări
-- ---------------------------------------------------------------------------
create table if not exists public.appointments (
  id text primary key,
  service_ids text[] not null,
  staff_id text not null,
  date date not null,
  time text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  client_name text not null,
  client_phone text not null,
  client_email text not null,
  status text not null default 'confirmed'
    check (status in ('confirmed', 'pending', 'cancelled', 'completed')),
  created_at timestamptz not null default now()
);

create index if not exists appointments_date_idx on public.appointments (date);
create index if not exists appointments_phone_idx on public.appointments (client_phone);

alter table public.appointments enable row level security;

-- Insert programări din site (anon) — fără SELECT direct (PII)
drop policy if exists "anon_insert_appointments" on public.appointments;
create policy "anon_insert_appointments"
  on public.appointments
  for insert
  to anon, authenticated
  with check (true);

-- Citește doar prin RPC (telefonul clientului)
-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.normalize_phone(p text)
returns text
language sql
immutable
as $$
  select regexp_replace(coalesce(p, ''), '\D', '', 'g');
$$;

create or replace function public.mask_email(p text)
returns text
language sql
immutable
as $$
  select case
    when p is null or position('@' in p) = 0 then '***'
    else left(split_part(p, '@', 1), 1) || '***@' || split_part(p, '@', 2)
  end;
$$;

-- ---------------------------------------------------------------------------
-- RPC: register
-- ---------------------------------------------------------------------------
create or replace function public.register_client(
  p_name text,
  p_phone text,
  p_email text,
  p_password text
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_phone text := public.normalize_phone(p_phone);
  v_email text := lower(trim(p_email));
  v_name text := trim(p_name);
  v_row public.clients%rowtype;
begin
  if length(v_name) < 2 then
    return json_build_object('ok', false, 'error', 'Introdu numele complet.');
  end if;
  if length(v_phone) < 9 then
    return json_build_object('ok', false, 'error', 'Număr de telefon invalid.');
  end if;
  if v_email !~* '^[^@]+@[^@]+\.[^@]+$' then
    return json_build_object('ok', false, 'error', 'Email invalid.');
  end if;
  if length(p_password) < 6 then
    return json_build_object('ok', false, 'error', 'Parola trebuie să aibă cel puțin 6 caractere.');
  end if;

  if exists (select 1 from public.clients c where c.phone = v_phone) then
    return json_build_object('ok', false, 'error', 'Există deja un cont cu acest telefon.');
  end if;
  if exists (select 1 from public.clients c where c.email = v_email) then
    return json_build_object('ok', false, 'error', 'Există deja un cont cu acest email.');
  end if;

  insert into public.clients (name, phone, email, password_hash)
  values (v_name, v_phone, v_email, crypt(p_password, gen_salt('bf')))
  returning * into v_row;

  return json_build_object(
    'ok', true,
    'user', json_build_object(
      'id', v_row.id,
      'name', v_row.name,
      'phone', v_row.phone,
      'email', v_row.email,
      'createdAt', v_row.created_at
    )
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- RPC: login (telefon sau email)
-- ---------------------------------------------------------------------------
create or replace function public.login_client(
  p_login text,
  p_password text
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_login text := trim(p_login);
  v_phone text := public.normalize_phone(p_login);
  v_row public.clients%rowtype;
begin
  select * into v_row
  from public.clients c
  where c.phone = v_phone
     or c.email = lower(v_login)
  limit 1;

  if not found or v_row.password_hash <> crypt(p_password, v_row.password_hash) then
    return json_build_object('ok', false, 'error', 'Date de autentificare greșite.');
  end if;

  return json_build_object(
    'ok', true,
    'user', json_build_object(
      'id', v_row.id,
      'name', v_row.name,
      'phone', v_row.phone,
      'email', v_row.email,
      'createdAt', v_row.created_at
    )
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- RPC: lookup pentru reset (după telefon sau email)
-- ---------------------------------------------------------------------------
create or replace function public.find_client_hint(p_login text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_login text := trim(p_login);
  v_phone text := public.normalize_phone(p_login);
  v_row public.clients%rowtype;
begin
  select * into v_row
  from public.clients c
  where c.phone = v_phone
     or c.email = lower(v_login)
  limit 1;

  if not found then
    return json_build_object('ok', false, 'error', 'Nu există cont cu aceste date.');
  end if;

  return json_build_object(
    'ok', true,
    'hasEmail', true,
    'maskedEmail', public.mask_email(v_row.email),
    'email', v_row.email
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- RPC: pornește reset — generează OTP (returnat o dată, trimis pe EmailJS)
-- ---------------------------------------------------------------------------
create or replace function public.start_password_reset(p_login text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_login text := trim(p_login);
  v_phone text := public.normalize_phone(p_login);
  v_row public.clients%rowtype;
  v_otp text;
  v_id uuid;
begin
  select * into v_row
  from public.clients c
  where c.phone = v_phone
     or c.email = lower(v_login)
  limit 1;

  if not found then
    return json_build_object('ok', false, 'error', 'Nu există cont cu aceste date.');
  end if;

  -- Max 3 challenge-uri / 15 min
  if (
    select count(*) from public.password_reset_challenges ch
    where ch.client_id = v_row.id
      and ch.created_at > now() - interval '15 minutes'
  ) >= 3 then
    return json_build_object('ok', false, 'error', 'Prea multe încercări. Reîncearcă peste câteva minute.');
  end if;

  v_otp := lpad((floor(random() * 1000000))::int::text, 6, '0');

  delete from public.password_reset_challenges
  where client_id = v_row.id;

  insert into public.password_reset_challenges (client_id, code_hash, expires_at)
  values (v_row.id, crypt(v_otp, gen_salt('bf')), now() + interval '10 minutes')
  returning id into v_id;

  return json_build_object(
    'ok', true,
    'challengeId', v_id,
    'otp', v_otp,
    'maskedEmail', public.mask_email(v_row.email),
    'email', v_row.email,
    'userName', v_row.name
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- RPC: finalizează reset cu OTP + parolă nouă
-- ---------------------------------------------------------------------------
create or replace function public.complete_password_reset(
  p_challenge_id uuid,
  p_otp text,
  p_new_password text
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ch public.password_reset_challenges%rowtype;
begin
  if length(p_new_password) < 6 then
    return json_build_object('ok', false, 'error', 'Parola nouă trebuie să aibă cel puțin 6 caractere.');
  end if;

  select * into v_ch
  from public.password_reset_challenges
  where id = p_challenge_id;

  if not found then
    return json_build_object('ok', false, 'error', 'Sesiunea a expirat. Reia resetarea.');
  end if;

  if v_ch.expires_at < now() then
    delete from public.password_reset_challenges where id = v_ch.id;
    return json_build_object('ok', false, 'error', 'Codul a expirat. Cere unul nou.');
  end if;

  update public.password_reset_challenges
  set attempts = attempts + 1
  where id = v_ch.id
  returning * into v_ch;

  if v_ch.attempts > 5 then
    delete from public.password_reset_challenges where id = v_ch.id;
    return json_build_object('ok', false, 'error', 'Prea multe încercări. Reia resetarea.');
  end if;

  if v_ch.code_hash <> crypt(trim(p_otp), v_ch.code_hash) then
    return json_build_object('ok', false, 'error', 'Cod incorrect.');
  end if;

  update public.clients
  set password_hash = crypt(p_new_password, gen_salt('bf'))
  where id = v_ch.client_id;

  delete from public.password_reset_challenges where client_id = v_ch.client_id;

  return json_build_object('ok', true);
end;
$$;

-- ---------------------------------------------------------------------------
-- RPC: programări după telefon
-- ---------------------------------------------------------------------------
create or replace function public.get_appointments_for_phone(p_phone text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_phone text := public.normalize_phone(p_phone);
begin
  return coalesce(
    (
      select json_agg(row_to_json(x) order by x.starts_at desc)
      from (
        select
          a.id,
          a.service_ids as "serviceIds",
          a.staff_id as "staffId",
          to_char(a.date, 'YYYY-MM-DD') as date,
          a.time,
          a.starts_at as "startsAt",
          a.ends_at as "endsAt",
          a.client_name as "clientName",
          a.client_phone as "clientPhone",
          a.client_email as "clientEmail",
          a.status,
          a.created_at as "createdAt"
        from public.appointments a
        where public.normalize_phone(a.client_phone) = v_phone
          and a.status <> 'cancelled'
      ) x
    ),
    '[]'::json
  );
end;
$$;

-- Sloturi fără PII (disponibilitate pe toate dispozitivele)
create or replace function public.list_appointment_slots()
returns json
language sql
security definer
set search_path = public
as $$
  select coalesce(
    (
      select json_agg(row_to_json(x))
      from (
        select
          a.id,
          a.staff_id as "staffId",
          to_char(a.date, 'YYYY-MM-DD') as date,
          a.time,
          a.starts_at as "startsAt",
          a.ends_at as "endsAt",
          a.status
        from public.appointments a
        where a.status <> 'cancelled'
          and a.date >= (current_date - 1)
      ) x
    ),
    '[]'::json
  );
$$;

grant execute on function public.register_client(text, text, text, text) to anon, authenticated;
grant execute on function public.login_client(text, text) to anon, authenticated;
grant execute on function public.find_client_hint(text) to anon, authenticated;
grant execute on function public.start_password_reset(text) to anon, authenticated;
grant execute on function public.complete_password_reset(uuid, text, text) to anon, authenticated;
grant execute on function public.get_appointments_for_phone(text) to anon, authenticated;
grant execute on function public.list_appointment_slots() to anon, authenticated;
