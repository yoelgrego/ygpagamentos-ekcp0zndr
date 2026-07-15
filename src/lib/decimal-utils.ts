export function normalizeDecimalInput(value: string): string {
  let result = value.replace(/,/g, '.')
  result = result.replace(/[^\d.]/g, '')
  const firstDot = result.indexOf('.')
  if (firstDot === -1) return result
  const intPart = result.slice(0, firstDot + 1)
  const decPart = result.slice(firstDot + 1).replace(/\./g, '')
  return intPart + decPart
}

export function isValidDecimal(value: string): boolean {
  if (!value) return false
  return /^\d+(\.\d+)?$/.test(value)
}
