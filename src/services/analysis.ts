import pb from '@/lib/pocketbase/client'
import type { AnalysisFilters, MovimentoRecord } from '@/lib/analysis-utils'
import { buildFilterExpression } from '@/lib/analysis-utils'

export async function fetchMovimentosForAnalysis(
  filters: AnalysisFilters,
): Promise<MovimentoRecord[]> {
  const filterExpr = buildFilterExpression(filters)
  const records = await pb.collection('01movimento').getFullList({
    filter: filterExpr,
    sort: 'ano, mes, idfornece',
  })
  return records as unknown as MovimentoRecord[]
}

export async function fetchMoveObjetosForAnalysis(
  idmovs: number[],
): Promise<{ idmov: number; idobj: number }[]> {
  if (idmovs.length === 0) return []
  const all = await pb.collection('02moveobjeto').getFullList()
  const idmovSet = new Set(idmovs)
  return all
    .filter((mo: any) => idmovSet.has(mo.idmov))
    .map((mo: any) => ({ idmov: mo.idmov, idobj: mo.idobj }))
}
