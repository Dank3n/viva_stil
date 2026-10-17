/** Normalizează telefonul pentru potrivire (doar cifre). */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10 && digits.startsWith('07')) return digits
  if (digits.length === 11 && digits.startsWith('407')) return `0${digits.slice(2)}`
  if (digits.length === 12 && digits.startsWith('4007')) return `0${digits.slice(3)}`
  return digits
}

export function phonesMatch(a: string, b: string): boolean {
  const na = normalizePhone(a)
  const nb = normalizePhone(b)
  if (!na || !nb) return false
  return na === nb || na.endsWith(nb) || nb.endsWith(na)
}
