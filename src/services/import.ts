import pb from '@/lib/pocketbase/client'
import type { ValidatedRow, ImportError } from '@/lib/import-validation'

export interface ImportSummary {
  total: number
  success: number
  failed: number
  errors: ImportError[]
}

export async function importMovimentos(
  rows: ValidatedRow[],
  onProgress: (current: number, total: number) => void,
): Promise<ImportSummary> {
  const errors: ImportError[] = []
  let success = 0

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    onProgress(i + 1, rows.length)

    if (!row.isValid) {
      errors.push(...row.errors)
      continue
    }

    try {
      await pb.collection('01movimento').create(row.data)
      success++
    } catch (err: any) {
      const fieldErrors = err?.response?.data
      if (fieldErrors && typeof fieldErrors === 'object') {
        for (const [field, detail] of Object.entries(fieldErrors)) {
          const message = (detail as any)?.message || 'Erro de validação'
          errors.push({
            row: row.rowIndex,
            field,
            reason: message,
            value: String(row.data[field] ?? ''),
          })
        }
      } else {
        errors.push({
          row: row.rowIndex,
          field: '',
          reason: err?.message || 'Erro desconhecido',
          value: '',
        })
      }
    }
  }

  return { total: rows.length, success, failed: errors.length, errors }
}
