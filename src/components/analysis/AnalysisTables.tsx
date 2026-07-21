import type { AggregatedData } from '@/lib/analysis-utils'
import { formatCurrency } from '@/lib/analysis-utils'

interface AnalysisTablesProps {
  byObjeto: AggregatedData[]
  byFornecedor: AggregatedData[]
  byCategoria: AggregatedData[]
}

function DataTable({ title, data }: { title: string; data: AggregatedData[] }) {
  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <h4 className="text-xs font-bold p-2 bg-yg-dark text-white">{title}</h4>
      <div className="max-h-[200px] overflow-auto">
        <table className="w-full text-[10px]">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="text-left p-1.5 font-semibold">Nome</th>
              <th className="text-right p-1.5 font-semibold">Total</th>
              <th className="text-right p-1.5 font-semibold">Média</th>
              <th className="text-right p-1.5 font-semibold">Qtd</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center p-2 text-gray-400">
                  Sem dados
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="p-1.5 truncate max-w-[120px]">{row.label}</td>
                  <td className="p-1.5 text-right whitespace-nowrap">
                    {formatCurrency(row.total)}
                  </td>
                  <td className="p-1.5 text-right whitespace-nowrap">
                    {formatCurrency(row.average)}
                  </td>
                  <td className="p-1.5 text-right">{row.count}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function AnalysisTables({ byObjeto, byFornecedor, byCategoria }: AnalysisTablesProps) {
  return (
    <div className="grid grid-cols-3 gap-3 mt-3" id="analysis-tables">
      <DataTable title="Por Objeto" data={byObjeto} />
      <DataTable title="Por Fornecedor" data={byFornecedor} />
      <DataTable title="Por Categoria" data={byCategoria} />
    </div>
  )
}
