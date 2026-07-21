import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { MONTHS, type AnalysisFilters, type PeriodMode } from '@/lib/analysis-utils'

interface AnalysisFilterPanelProps {
  filters: AnalysisFilters
  onChange: (filters: AnalysisFilters) => void
  pagadores: any[]
  beneficiarios: any[]
}

export function AnalysisFilterPanel({
  filters,
  onChange,
  pagadores,
  beneficiarios,
}: AnalysisFilterPanelProps) {
  const update = (partial: Partial<AnalysisFilters>) => onChange({ ...filters, ...partial })

  const renderMonthSelect = (value: number, onChange: (v: number) => void, width = 'w-32') => (
    <Select value={String(value)} onValueChange={(v) => onChange(Number(v))}>
      <SelectTrigger className={`${width} h-8 text-xs`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {MONTHS.map((m) => (
          <SelectItem key={m.value} value={String(m.value)}>
            {m.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )

  const renderYearInput = (value: number, onChange: (v: number) => void) => (
    <input
      type="number"
      className="w-20 h-8 border rounded px-2 text-xs"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  )

  return (
    <div className="flex flex-wrap gap-3 items-end p-3 bg-gray-50 rounded-lg border">
      <div className="flex flex-col gap-1">
        <Label className="text-xs font-semibold">Período</Label>
        <Select
          value={filters.periodMode}
          onValueChange={(v) => update({ periodMode: v as PeriodMode })}
        >
          <SelectTrigger className="w-44 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sem filtro</SelectItem>
            <SelectItem value="specific">Mês/Ano específico</SelectItem>
            <SelectItem value="range">Faixa de datas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filters.periodMode === 'specific' && (
        <>
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-semibold">Mês</Label>
            {renderMonthSelect(filters.specificMonth, (v) => update({ specificMonth: v }))}
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-semibold">Ano</Label>
            {renderYearInput(filters.specificYear, (v) => update({ specificYear: v }))}
          </div>
        </>
      )}

      {filters.periodMode === 'range' && (
        <>
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-semibold">De: Mês</Label>
            {renderMonthSelect(
              filters.rangeStartMonth,
              (v) => update({ rangeStartMonth: v }),
              'w-28',
            )}
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-semibold">De: Ano</Label>
            {renderYearInput(filters.rangeStartYear, (v) => update({ rangeStartYear: v }))}
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-semibold">Até: Mês</Label>
            {renderMonthSelect(filters.rangeEndMonth, (v) => update({ rangeEndMonth: v }), 'w-28')}
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-semibold">Até: Ano</Label>
            {renderYearInput(filters.rangeEndYear, (v) => update({ rangeEndYear: v }))}
          </div>
        </>
      )}

      <div className="flex flex-col gap-1">
        <Label className="text-xs font-semibold">Pagador</Label>
        <Select
          value={filters.pagadorId !== null ? String(filters.pagadorId) : 'all'}
          onValueChange={(v) => update({ pagadorId: v === 'all' ? null : Number(v) })}
        >
          <SelectTrigger className="w-40 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {pagadores.map((p: any) => (
              <SelectItem key={p.idpaga} value={String(p.idpaga)}>
                {p.nopaga}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-xs font-semibold">Beneficiário</Label>
        <Select
          value={filters.beneficiarioId !== null ? String(filters.beneficiarioId) : 'all'}
          onValueChange={(v) => update({ beneficiarioId: v === 'all' ? null : Number(v) })}
        >
          <SelectTrigger className="w-40 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {beneficiarios.map((b: any) => (
              <SelectItem key={b.idbenef} value={String(b.idbenef)}>
                {b.nobenef}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
