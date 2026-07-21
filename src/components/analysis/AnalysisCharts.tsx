import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import type { AggregatedData, TimelinePoint } from '@/lib/analysis-utils'
import { formatCurrency, CHART_COLORS } from '@/lib/analysis-utils'

interface AnalysisChartsProps {
  byCategoria: AggregatedData[]
  byFornecedor: AggregatedData[]
  timeline: TimelinePoint[]
}

export function AnalysisCharts({ byCategoria, byFornecedor, timeline }: AnalysisChartsProps) {
  const barConfig: ChartConfig = { total: { label: 'Total', color: '#1e40af' } }
  const lineConfig: ChartConfig = {
    total: { label: 'Valor', color: '#0891b2' },
    count: { label: 'Quantidade', color: '#059669' },
  }
  const pieData = byCategoria.slice(0, 8).map((d, i) => ({
    name: d.label,
    value: d.total,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }))

  return (
    <div className="grid grid-cols-2 gap-3 mt-3" id="analysis-charts">
      <div className="border rounded-lg p-2 bg-white">
        <h4 className="text-xs font-bold mb-1 text-yg-dark">Total por Categoria</h4>
        <ChartContainer config={barConfig} className="h-[180px] w-full">
          <BarChart
            data={byCategoria.slice(0, 10)}
            margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 9 }}
              angle={-45}
              textAnchor="end"
              height={50}
              interval={0}
            />
            <YAxis tick={{ fontSize: 9 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ fontSize: 10 }} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="total" name="Total" fill="#1e40af" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </div>

      <div className="border rounded-lg p-2 bg-white">
        <h4 className="text-xs font-bold mb-1 text-yg-dark">Total por Fornecedor</h4>
        <ChartContainer config={barConfig} className="h-[180px] w-full">
          <BarChart
            data={byFornecedor.slice(0, 10)}
            margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 9 }}
              angle={-45}
              textAnchor="end"
              height={50}
              interval={0}
            />
            <YAxis tick={{ fontSize: 9 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ fontSize: 10 }} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="total" name="Total" fill="#0891b2" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </div>

      <div className="border rounded-lg p-2 bg-white">
        <h4 className="text-xs font-bold mb-1 text-yg-dark">Evolução Temporal</h4>
        <ChartContainer config={lineConfig} className="h-[180px] w-full">
          <LineChart data={timeline} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="label" tick={{ fontSize: 9 }} />
            <YAxis tick={{ fontSize: 9 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ fontSize: 10 }} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Line
              type="monotone"
              dataKey="total"
              name="Valor Total"
              stroke="#0891b2"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="count"
              name="Quantidade"
              stroke="#059669"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ChartContainer>
      </div>

      <div className="border rounded-lg p-2 bg-white">
        <h4 className="text-xs font-bold mb-1 text-yg-dark">Distribuição (%)</h4>
        <ChartContainer config={{}} className="h-[180px] w-full">
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={60}
              label={{ fontSize: 9 }}
            >
              {pieData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ fontSize: 10 }} />
            <Legend wrapperStyle={{ fontSize: 9 }} />
          </PieChart>
        </ChartContainer>
      </div>
    </div>
  )
}
