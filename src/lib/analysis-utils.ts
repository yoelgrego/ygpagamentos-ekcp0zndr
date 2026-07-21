export type PeriodMode = 'none' | 'specific' | 'range'

export interface AnalysisFilters {
  periodMode: PeriodMode
  specificMonth: number
  specificYear: number
  rangeStartMonth: number
  rangeStartYear: number
  rangeEndMonth: number
  rangeEndYear: number
  pagadorId: number | null
  beneficiarioId: number | null
}

export interface MovimentoRecord {
  id: string
  idm: number
  ano: number
  mes: number
  dia: number
  idfornece: number
  idbenef: number
  idmoeda: number
  valor: number
  idtipo: number
  card: number
  idpaga: number
  idcat: number
  idnat: number
  pago: string
}

export interface AggregatedData {
  label: string
  total: number
  average: number
  count: number
}

export interface TimelinePoint {
  label: string
  sortKey: number
  total: number
  count: number
}

export function buildFilterExpression(filters: AnalysisFilters): string {
  const parts: string[] = ['card != 2', "pago = 'Q'"]

  if (filters.periodMode === 'specific') {
    parts.push(`(ano = ${filters.specificYear} && mes = ${filters.specificMonth})`)
  } else if (filters.periodMode === 'range') {
    parts.push(
      `((ano > ${filters.rangeStartYear} || (ano = ${filters.rangeStartYear} && mes >= ${filters.rangeStartMonth})) && (ano < ${filters.rangeEndYear} || (ano = ${filters.rangeEndYear} && mes <= ${filters.rangeEndMonth})))`,
    )
  }

  if (filters.pagadorId !== null) {
    parts.push(`idpaga = ${filters.pagadorId}`)
  }
  if (filters.beneficiarioId !== null) {
    parts.push(`idbenef = ${filters.beneficiarioId}`)
  }

  return parts.join(' && ')
}

export function createLookupMap(
  items: any[],
  idField: string,
  nameField: string,
): Map<number, string> {
  const map = new Map<number, string>()
  for (const item of items) {
    map.set(Number(item[idField]), item[nameField] || '')
  }
  return map
}

export function aggregateBy(
  movements: MovimentoRecord[],
  idField: keyof MovimentoRecord,
  lookupMap: Map<number, string>,
): AggregatedData[] {
  const groups = new Map<number, { total: number; count: number }>()
  for (const mov of movements) {
    const id = mov[idField] as number
    if (!groups.has(id)) groups.set(id, { total: 0, count: 0 })
    const g = groups.get(id)!
    g.total += Number(mov.valor) || 0
    g.count += 1
  }
  return Array.from(groups.entries())
    .map(([id, data]) => ({
      label: lookupMap.get(id) || `ID ${id}`,
      total: data.total,
      average: data.count > 0 ? data.total / data.count : 0,
      count: data.count,
    }))
    .sort((a, b) => b.total - a.total)
}

export function aggregateByObjeto(
  movements: MovimentoRecord[],
  moveobjetos: { idmov: number; idobj: number }[],
  objetoMap: Map<number, string>,
): AggregatedData[] {
  const movToObjetos = new Map<number, number[]>()
  for (const mo of moveobjetos) {
    if (!movToObjetos.has(mo.idmov)) movToObjetos.set(mo.idmov, [])
    movToObjetos.get(mo.idmov)!.push(mo.idobj)
  }
  const groups = new Map<number, { total: number; count: number }>()
  for (const mov of movements) {
    const objIds = movToObjetos.get(mov.idm)
    if (!objIds || objIds.length === 0) continue
    const perObjeto = Number(mov.valor) / objIds.length
    for (const objId of objIds) {
      if (!groups.has(objId)) groups.set(objId, { total: 0, count: 0 })
      const g = groups.get(objId)!
      g.total += perObjeto
      g.count += 1
    }
  }
  return Array.from(groups.entries())
    .map(([id, data]) => ({
      label: objetoMap.get(id) || `ID ${id}`,
      total: data.total,
      average: data.count > 0 ? data.total / data.count : 0,
      count: data.count,
    }))
    .sort((a, b) => b.total - a.total)
}

export function buildTimeline(movements: MovimentoRecord[]): TimelinePoint[] {
  const groups = new Map<string, { total: number; count: number; sortKey: number }>()
  for (const mov of movements) {
    const key = `${mov.ano}-${String(mov.mes).padStart(2, '0')}`
    const sortKey = mov.ano * 100 + mov.mes
    if (!groups.has(key)) groups.set(key, { total: 0, count: 0, sortKey })
    const g = groups.get(key)!
    g.total += Number(mov.valor) || 0
    g.count += 1
  }
  return Array.from(groups.entries())
    .map(([label, data]) => ({
      label,
      sortKey: data.sortKey,
      total: data.total,
      count: data.count,
    }))
    .sort((a, b) => a.sortKey - b.sortKey)
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export const MONTHS = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' },
]

export const CHART_COLORS = [
  '#1e40af',
  '#0891b2',
  '#059669',
  '#d97706',
  '#dc2626',
  '#7c3aed',
  '#db2777',
  '#ca8a04',
]
