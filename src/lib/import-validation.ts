export interface ImportError {
  row: number
  field: string
  reason: string
  value: string
}

export interface ValidatedRow {
  rowIndex: number
  data: Record<string, any>
  rawData: Record<string, string>
  errors: ImportError[]
  isValid: boolean
}

export interface FieldDef {
  key: string
  label: string
  type: 'number' | 'text'
  required: boolean
  min?: number
  max?: number
}

export type ExistingIds = Record<string, Set<number>>

const ID_FIELDS = ['idfornece', 'idbenef', 'idmoeda', 'idtipo', 'idpaga', 'idcat', 'idnat']

export const IMPORT_FIELDS: FieldDef[] = [
  { key: 'idm', label: 'ID Movimento', type: 'number', required: false },
  { key: 'ano', label: 'Ano', type: 'number', required: true, min: 1000 },
  { key: 'mes', label: 'Mês', type: 'number', required: true, min: 1, max: 12 },
  { key: 'dia', label: 'Dia', type: 'number', required: false, min: 1, max: 31 },
  { key: 'idfornece', label: 'Fornecedor', type: 'number', required: true },
  { key: 'idbenef', label: 'Beneficiário', type: 'number', required: true },
  { key: 'idmoeda', label: 'Moeda', type: 'number', required: true },
  { key: 'valor', label: 'Valor', type: 'number', required: true },
  { key: 'idtipo', label: 'Tipo Doc', type: 'number', required: true },
  { key: 'card', label: 'Cartão', type: 'number', required: true },
  { key: 'idpaga', label: 'Pagador', type: 'number', required: true },
  { key: 'idcat', label: 'Categoria', type: 'number', required: true },
  { key: 'idnat', label: 'Natureza', type: 'number', required: true },
  { key: 'pago', label: 'Pago', type: 'text', required: false },
]

export function normalizeDecimal(value: string): string {
  const lastComma = value.lastIndexOf(',')
  const lastDot = value.lastIndexOf('.')
  if (lastComma === -1) return value
  if (lastDot === -1) {
    const after = value.substring(lastComma + 1)
    if (after.length <= 2) return value.replace(',', '.')
    return value.replace(/,/g, '')
  }
  if (lastComma > lastDot) return value.replace(/\./g, '').replace(',', '.')
  return value.replace(/,/g, '')
}

export function autoDetectMapping(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {}
  for (const field of IMPORT_FIELDS) {
    const exact = headers.find((h) => h.toLowerCase().trim() === field.key.toLowerCase())
    if (exact) {
      mapping[field.key] = exact
      continue
    }
    const labelMatch = headers.find(
      (h) =>
        h.toLowerCase().replace(/[^a-z0-9]/g, '') ===
        field.label.toLowerCase().replace(/[^a-z0-9]/g, ''),
    )
    if (labelMatch) {
      mapping[field.key] = labelMatch
      continue
    }
    const partial = headers.find(
      (h) =>
        h.toLowerCase().includes(field.key.toLowerCase()) ||
        field.key.toLowerCase().includes(h.toLowerCase()),
    )
    if (partial) mapping[field.key] = partial
  }
  return mapping
}

export function validateRow(
  rowIndex: number,
  row: Record<string, string>,
  mapping: Record<string, string>,
  existingIds?: ExistingIds,
): ValidatedRow {
  const errors: ImportError[] = []
  const data: Record<string, any> = {}
  for (const field of IMPORT_FIELDS) {
    const sourceCol = mapping[field.key]
    if (!sourceCol) {
      if (field.required)
        errors.push({
          row: rowIndex,
          field: field.key,
          reason: `${field.label} não mapeado`,
          value: '',
        })
      continue
    }
    const raw = (row[sourceCol] ?? '').toString().trim()
    if (!raw) {
      if (field.required)
        errors.push({
          row: rowIndex,
          field: field.key,
          reason: `${field.label} é obrigatório`,
          value: '',
        })
      continue
    }
    if (field.type === 'number') {
      const normalized = normalizeDecimal(raw)
      const num = parseFloat(normalized)
      if (isNaN(num)) {
        errors.push({
          row: rowIndex,
          field: field.key,
          reason: `${field.label}: valor inválido`,
          value: raw,
        })
        continue
      }
      if (field.min !== undefined && num < field.min) {
        errors.push({
          row: rowIndex,
          field: field.key,
          reason: `${field.label} deve ser maior ou igual a ${field.min}`,
          value: raw,
        })
        continue
      }
      if (field.max !== undefined && num > field.max) {
        errors.push({
          row: rowIndex,
          field: field.key,
          reason: `${field.label} deve ser menor ou igual a ${field.max}`,
          value: raw,
        })
        continue
      }
      if (existingIds && ID_FIELDS.includes(field.key) && !existingIds[field.key]?.has(num)) {
        errors.push({
          row: rowIndex,
          field: field.key,
          reason: `${field.label}: ID ${num} não existe na coleção`,
          value: raw,
        })
        continue
      }
      data[field.key] = num
    } else {
      data[field.key] = raw
    }
  }
  if (!data.idm && !errors.some((e) => e.field === 'idm'))
    data.idm = Math.floor(Math.random() * 1000000)
  return { rowIndex, data, rawData: row, errors, isValid: errors.length === 0 }
}

export function validateAllRows(
  rows: Record<string, string>[],
  mapping: Record<string, string>,
  existingIds?: ExistingIds,
): ValidatedRow[] {
  return rows.map((row, i) => validateRow(i + 1, row, mapping, existingIds))
}

export function rowsToObjects(headers: string[], rows: string[][]): Record<string, string>[] {
  return rows.map((r) => {
    const obj: Record<string, string> = {}
    headers.forEach((h, i) => {
      obj[h] = (r[i] || '').trim()
    })
    return obj
  })
}
