import { useState } from 'react'
import type { ImportSummary } from '@/services/import'
import { Button } from '@/components/ui/button'
import { Download, Copy, CheckCircle, XCircle, FileText } from 'lucide-react'
import { toast } from 'sonner'

interface ImportResultsProps {
  summary: ImportSummary
  onReset: () => void
}

export function ImportResults({ summary, onReset }: ImportResultsProps) {
  const [copied, setCopied] = useState(false)

  const handleDownloadErrorReport = () => {
    if (summary.failedRows.length === 0) return
    const allKeys = new Set<string>()
    summary.failedRows.forEach((row) => {
      Object.keys(row.rawData).forEach((key) => allKeys.add(key))
    })
    const headers = [...allKeys, 'error_reason']
    const escape = (val: string) => `"${String(val).replace(/"/g, '""')}"`
    const csv = [
      headers.join(','),
      ...summary.failedRows.map((row) =>
        headers
          .map((h) => escape(h === 'error_reason' ? row.errorReason : (row.rawData[h] ?? '')))
          .join(','),
      ),
    ].join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'relatorio_erros_importacao.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleCopy = async () => {
    const text = summary.errors
      .map((e) => `Linha ${e.row} | ${e.field || '—'} | ${e.reason}`)
      .join('\n')
    await navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Relatório copiado!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-3">
        <div className="flex-1 bg-white border border-gray-400 p-3 flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-500" />
          <div>
            <p className="text-[10px] text-gray-500">Total</p>
            <p className="text-lg font-bold text-yg-dark">{summary.total}</p>
          </div>
        </div>
        <div className="flex-1 bg-white border border-gray-400 p-3 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-[10px] text-gray-500">Importados</p>
            <p className="text-lg font-bold text-green-600">{summary.success}</p>
          </div>
        </div>
        <div className="flex-1 bg-white border border-gray-400 p-3 flex items-center gap-2">
          <XCircle className="w-5 h-5 text-red-600" />
          <div>
            <p className="text-[10px] text-gray-500">Falhas</p>
            <p className="text-lg font-bold text-red-600">{summary.failed}</p>
          </div>
        </div>
      </div>

      {summary.errors.length > 0 && (
        <>
          <div className="flex gap-1">
            <Button
              onClick={handleDownloadErrorReport}
              className="h-[24px] px-3 bg-yg-dark text-white text-[11px] font-bold hover:bg-blue-800"
            >
              <Download className="w-3 h-3" /> Baixar Relatório de Erros
            </Button>
            <button
              onClick={handleCopy}
              className="h-[24px] px-3 bg-gray-300 border border-gray-500 text-black text-[11px] font-bold flex items-center gap-1 hover:bg-gray-400 transition-colors"
            >
              {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              Copiar
            </button>
          </div>
          <div className="border border-gray-400 bg-white overflow-auto yg-scrollbar max-h-[280px]">
            <table className="w-full text-[11px] border-collapse">
              <thead className="bg-yg-dark text-white sticky top-0">
                <tr>
                  <th className="p-1 px-2 text-left border-r border-white/20">Linha</th>
                  <th className="p-1 px-2 text-left border-r border-white/20">Campo</th>
                  <th className="p-1 px-2 text-left border-r border-white/20">Motivo</th>
                  <th className="p-1 px-2 text-left">Valor</th>
                </tr>
              </thead>
              <tbody>
                {summary.errors.map((e, i) => (
                  <tr key={i} className="border-b border-gray-200 hover:bg-red-50">
                    <td className="p-1 px-2 font-mono">{e.row}</td>
                    <td className="p-1 px-2 font-mono text-yg-dark">{e.field || '—'}</td>
                    <td className="p-1 px-2 text-red-600">{e.reason}</td>
                    <td className="p-1 px-2 text-gray-500 truncate max-w-[100px]">{e.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {summary.errors.length === 0 && summary.success > 0 && (
        <p className="text-center text-green-600 font-semibold text-sm py-4">
          Todos os registros foram importados com sucesso!
        </p>
      )}

      <button
        onClick={onReset}
        className="h-[28px] bg-yg-dark text-white font-bold text-[12px] hover:bg-blue-800 transition-colors"
      >
        Nova Importação
      </button>
    </div>
  )
}
