import type { MovimentoRecord } from '@/lib/analysis-utils'
import { formatCurrency } from '@/lib/analysis-utils'

interface AnalysisSummaryProps {
  movimentos: MovimentoRecord[]
}

export function AnalysisSummary({ movimentos }: AnalysisSummaryProps) {
  const total = movimentos.reduce((sum, m) => sum + (Number(m.valor) || 0), 0)
  const count = movimentos.length
  const average = count > 0 ? total / count : 0
  const uniqueFornecedores = new Set(movimentos.map((m) => m.idfornece)).size
  const uniqueCategorias = new Set(movimentos.map((m) => m.idcat)).size

  const cards = [
    { label: 'Total Geral', value: formatCurrency(total), color: 'text-blue-700' },
    { label: 'Média por Registro', value: formatCurrency(average), color: 'text-cyan-700' },
    { label: 'Nº de Registros', value: String(count), color: 'text-green-700' },
    { label: 'Fornecedores', value: String(uniqueFornecedores), color: 'text-amber-700' },
    { label: 'Categorias', value: String(uniqueCategorias), color: 'text-violet-700' },
  ]

  return (
    <div className="grid grid-cols-5 gap-2 mt-3" id="analysis-summary">
      {cards.map((card) => (
        <div key={card.label} className="border rounded-lg p-2 bg-white text-center">
          <p className="text-[10px] text-gray-500 font-medium">{card.label}</p>
          <p className={`text-sm font-bold ${card.color} mt-0.5`}>{card.value}</p>
        </div>
      ))}
    </div>
  )
}
