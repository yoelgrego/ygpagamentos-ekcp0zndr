import pb from '@/lib/pocketbase/client'
import type { ValidatedRow, ImportError, ExistingIds } from '@/lib/import-validation'

export interface FailedRow {
  rowIndex: number
  rawData: Record<string, string>
  errorReason: string
}

export interface ImportSummary {
  total: number
  success: number
  updated: number
  failed: number
  errors: ImportError[]
  failedRows: FailedRow[]
}

const BATCH_SIZE = 50

export async function importMovimentos(
  rows: ValidatedRow[],
  onProgress: (current: number, total: number) => void,
  existingIdmMap?: Map<number, string>,
): Promise<ImportSummary> {
  const errors: ImportError[] = []
  const failedRows: FailedRow[] = []
  let success = 0
  let updated = 0

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, Math.min(i + BATCH_SIZE, rows.length))
    for (const row of batch) {
      if (!row.isValid) {
        errors.push(...row.errors)
        failedRows.push({
          rowIndex: row.rowIndex,
          rawData: row.rawData,
          errorReason: row.errors.map((e) => e.reason).join('; '),
        })
        continue
      }
      try {
        const idm = row.data.idm
        const existingId = existingIdmMap?.get(idm)
        if (existingId) {
          await pb.collection('01movimento').update(existingId, row.data)
          updated++
        } else {
          const created = await pb.collection('01movimento').create(row.data)
          success++
          if (existingIdmMap) existingIdmMap.set(idm, created.id)
        }
      } catch (err: any) {
        const fieldErrors = err?.response?.data
        if (fieldErrors && typeof fieldErrors === 'object') {
          const reasons: string[] = []
          for (const [field, detail] of Object.entries(fieldErrors)) {
            const detailObj = detail as any
            const isDuplicateIdm = detailObj?.code === 'validation_not_unique' && field === 'idm'
            const message = isDuplicateIdm
              ? `Duplicate ID: ${row.data.idm}`
              : detailObj?.message || 'Erro de validação'
            reasons.push(message)
            errors.push({
              row: row.rowIndex,
              field,
              reason: message,
              value: String(row.data[field] ?? ''),
            })
          }
          failedRows.push({
            rowIndex: row.rowIndex,
            rawData: row.rawData,
            errorReason: reasons.join('; '),
          })
        } else {
          errors.push({
            row: row.rowIndex,
            field: '',
            reason: err?.message || 'Erro desconhecido',
            value: '',
          })
          failedRows.push({
            rowIndex: row.rowIndex,
            rawData: row.rawData,
            errorReason: err?.message || 'Erro desconhecido',
          })
        }
      }
    }
    onProgress(Math.min(i + BATCH_SIZE, rows.length), rows.length)
    await new Promise((resolve) => setTimeout(resolve, 0))
  }

  return {
    total: rows.length,
    success,
    updated,
    failed: failedRows.length,
    errors,
    failedRows,
  }
}

export async function fetchExistingIds(): Promise<ExistingIds> {
  const [fornecedores, beneficiarios, moedas, tipodocs, pagadores, categorias, naturezas] =
    await Promise.all([
      pb.collection('03fornecedor').getFullList(),
      pb.collection('04beneficiario').getFullList(),
      pb.collection('05moeda').getFullList(),
      pb.collection('07tipodoc').getFullList(),
      pb.collection('08pagador').getFullList(),
      pb.collection('09catego').getFullList(),
      pb.collection('10natureza').getFullList(),
    ])
  return {
    idfornece: new Set(fornecedores.map((r: any) => r.idfornece)),
    idbenef: new Set(beneficiarios.map((r: any) => r.idbenef)),
    idmoeda: new Set(moedas.map((r: any) => r.idmoeda)),
    idtipo: new Set(tipodocs.map((r: any) => r.idtipo)),
    idpaga: new Set(pagadores.map((r: any) => r.idpaga)),
    idcat: new Set(categorias.map((r: any) => r.idcat)),
    idnat: new Set(naturezas.map((r: any) => r.idnat)),
  }
}

export async function fetchExistingIdmMap(): Promise<Map<number, string>> {
  const records = await pb.collection('01movimento').getFullList({
    fields: 'id,idm',
  })
  const map = new Map<number, string>()
  for (const r of records as any[]) {
    map.set(r.idm, r.id)
  }
  return map
}

export async function clearMovimentos(): Promise<void> {
  const records = await pb.collection('01movimento').getFullList()
  for (const record of records) {
    await pb.collection('01movimento').delete(record.id)
  }
}
