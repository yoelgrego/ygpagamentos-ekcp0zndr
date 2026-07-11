export function isValidAno(value: string): boolean {
  if (!value || value.length !== 4) return false
  const num = parseInt(value)
  return !isNaN(num) && num >= 1900
}

export function isValidMes(value: string): boolean {
  if (!value) return false
  const num = parseInt(value)
  return !isNaN(num) && num >= 1 && num <= 12
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

export function isValidDia(value: string, year: string, month: string): boolean {
  if (!value) return false
  const day = parseInt(value)
  if (isNaN(day) || day < 1) return false
  const y = parseInt(year)
  const m = parseInt(month)
  if (isNaN(y) || isNaN(m)) return false
  return day <= getDaysInMonth(y, m)
}

export function numericOnly(value: string): string {
  return value.replace(/\D/g, '')
}
