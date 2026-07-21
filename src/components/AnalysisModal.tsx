import { useState, useEffect, useMemo, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, FileDown } from 'lucide-react'
import { toast } from 'sonner'
import { AnalysisFilterPanel } from '@/components/analysis/AnalysisFilterPanel'
import { AnalysisCharts } from '@/components/analysis/AnalysisCharts'
import { AnalysisTables } from '@/components/analysis/AnalysisTables'
import { AnalysisSummary } from '@/components/analysis/AnalysisSummary'
import { useAppStore } from '@/stores/use-app-store'
import { fetchMovimentosForAnalysis, fetchMoveObjetosForAnalysis } from '@/services/analysis'
import {
  type AnalysisFilters,
  type MovimentoRecord,
  createLookupMap,
  aggregateBy,
  aggregateByObjeto,
  buildTimeline,
  formatCurrency,
} from '@/lib/analysis-utils'

interface AnalysisModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const now = new Date()
const defaultFilters: AnalysisFilters = {
  periodMode: 'none',
  specificMonth: now.getMonth() + 1,
  specificYear: now.getFullYear(),
  rangeStartMonth: 1,
  rangeStartYear: now.getFullYear(),
  rangeEndMonth: 12,
  rangeEndYear: now.getFullYear(),
  pagadorId: null,
  beneficiarioId: null,
}

export function AnalysisModal({ open, onOpenChange }: AnalysisModalProps) {
  const { pagadores, beneficiarios, fornecedores, categorias, objetos } = useAppStore()
  const [filters, setFilters] = useState<AnalysisFilters>(defaultFilters)
  const [movimentos, setMovimentos] = useState<MovimentoRecord[]>([])
  const [moveobjetos, setMoveobjetos] = useState<{ idmov: number; idobj: number }[]>([])
  const [loading, setLoading] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const movs = await fetchMovimentosForAnalysis(filters)
      setMovimentos(movs)
      const idmovs = movs.map((m) => m.idm)
      const mos = await fetchMoveObjetosForAnalysis(idmovs)
      setMoveobjetos(mos)
    } catch {
      setMovimentos([])
      setMoveobjetos([])
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    if (open) loadData()
  }, [open, loadData])

  const lookupMaps = useMemo(
    () => ({
      fornecedor: createLookupMap(fornecedores, 'idfornece', 'nofornece'),
      categoria: createLookupMap(categorias, 'idcat', 'nocat'),
      objeto: createLookupMap(objetos, 'idobj', 'nobj'),
    }),
    [fornecedores, categorias, objetos],
  )

  const aggregated = useMemo(
    () => ({
      byCategoria: aggregateBy(movimentos, 'idcat', lookupMaps.categoria),
      byFornecedor: aggregateBy(movimentos, 'idfornece', lookupMaps.fornecedor),
      byObjeto: aggregateByObjeto(movimentos, moveobjetos, lookupMaps.objeto),
      timeline: buildTimeline(movimentos),
    }),
    [movimentos, moveobjetos, lookupMaps],
  )

  const handleGerarPDF = () => {
    const canvas = document.getElementById('analysis-canvas')
    if (!canvas) return
    const printWindow = window.open('', '_blank', 'width=1200,height=800')
    if (!printWindow) {
      toast.error(
        'Não foi possível abrir a janela de impressão. Verifique o bloqueador de pop-ups.',
      )
      return
    }
    const totalGeral = movimentos.reduce((s, m) => s + (Number(m.valor) || 0), 0)
    printWindow.document
      .write(`<!DOCTYPE html><html><head><title>Análise Financeira - YGPagamentos</title>
      <style>
        @page { size: landscape; margin: 1cm; }
        body { font-family: system-ui, sans-serif; padding: 20px; background: white; color: #333; }
        h3 { font-size: 20px; margin-bottom: 5px; }
        h4 { font-size: 13px; margin: 10px 0 5px; font-weight: 700; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
        .grid-5 { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-bottom: 15px; }
        .card { border: 1px solid #ddd; padding: 8px; border-radius: 6px; text-align: center; }
        .card-label { font-size: 10px; color: #666; }
        .card-value { font-size: 14px; font-weight: 700; margin-top: 2px; }
        .chart-box { border: 1px solid #ddd; padding: 8px; border-radius: 6px; }
        table { width: 100%; border-collapse: collapse; font-size: 10px; }
        th { background: #1e3a5f; color: white; padding: 4px 6px; text-align: left; }
        td { padding: 3px 6px; border-bottom: 1px solid #eee; }
        svg { max-width: 100%; height: auto; }
        .summary { font-size: 12px; color: #666; margin-bottom: 10px; }
      </style></head><body>
      <h3>Análise Financeira - YGPagamentos</h3>
      <p class="summary">Total Geral: ${formatCurrency(totalGeral)} | Registros: ${movimentos.length}</p>
      ${canvas.innerHTML}
      <script>window.onload=function(){setTimeout(function(){window.print();},500);};</script>
      </body></html>`)
    printWindow.document.close()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-[95vw] h-[95vh] max-h-[95vh] overflow-auto p-4">
        <DialogHeader className="shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold text-yg-dark">
              Análise Financeira
            </DialogTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={handleGerarPDF}
              className="h-7 text-xs"
              disabled={loading || movimentos.length === 0}
            >
              <FileDown className="w-3 h-3 mr-1" /> Gerar PDF
            </Button>
          </div>
        </DialogHeader>

        <div id="analysis-canvas">
          <AnalysisFilterPanel
            filters={filters}
            onChange={setFilters}
            pagadores={pagadores}
            beneficiarios={beneficiarios}
          />

          {loading ? (
            <div className="flex items-center justify-center h-[400px]">
              <Loader2 className="w-6 h-6 text-yg-royal animate-spin" />
              <span className="ml-2 text-sm text-gray-600">Carregando análise...</span>
            </div>
          ) : movimentos.length === 0 ? (
            <div className="flex items-center justify-center h-[400px] text-gray-500 text-sm">
              Nenhum registro encontrado para os filtros selecionados.
            </div>
          ) : (
            <>
              <AnalysisSummary movimentos={movimentos} />
              <AnalysisCharts
                byCategoria={aggregated.byCategoria}
                byFornecedor={aggregated.byFornecedor}
                timeline={aggregated.timeline}
              />
              <AnalysisTables
                byObjeto={aggregated.byObjeto}
                byFornecedor={aggregated.byFornecedor}
                byCategoria={aggregated.byCategoria}
              />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
