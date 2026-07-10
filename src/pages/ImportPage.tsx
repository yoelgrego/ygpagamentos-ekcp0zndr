import { useState, useEffect } from 'react'
import { FileUpload } from '@/components/import/FileUpload'
import { ColumnMapping } from '@/components/import/ColumnMapping'
import { ImportResults } from '@/components/import/ImportResults'
import { parseFile, type ParsedFile } from '@/lib/file-parser'
import {
  autoDetectMapping,
  validateAllRows,
  rowsToObjects,
  type ValidatedRow,
  type ExistingIds,
} from '@/lib/import-validation'
import {
  importMovimentos,
  fetchExistingIds,
  fetchExistingIdmMap,
  clearMovimentos,
  type ImportSummary,
} from '@/services/import'
import { toast } from 'sonner'
import { ArrowLeft, ArrowRight, Loader2, Download, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { downloadImportTemplate } from '@/lib/import-template'

type Step = 'upload' | 'mapping' | 'importing' | 'results'

export default function ImportPage() {
  const [step, setStep] = useState<Step>('upload')
  const [parsing, setParsing] = useState(false)
  const [parsedFile, setParsedFile] = useState<ParsedFile | null>(null)
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [validatedRows, setValidatedRows] = useState<ValidatedRow[]>([])
  const [summary, setSummary] = useState<ImportSummary | null>(null)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [existingIds, setExistingIds] = useState<ExistingIds | null>(null)
  const [existingIdmMap, setExistingIdmMap] = useState<Map<number, string> | null>(null)
  const [clearing, setClearing] = useState(false)

  useEffect(() => {
    Promise.all([fetchExistingIds(), fetchExistingIdmMap()])
      .then(([ids, idmMap]) => {
        setExistingIds(ids)
        setExistingIdmMap(idmMap)
      })
      .catch(() => {})
  }, [])

  const handleFileSelected = async (file: File) => {
    setParsing(true)
    try {
      const parsed = await parseFile(file)
      if (parsed.rows.length === 0) {
        toast.error('Arquivo vazio ou sem dados')
        setParsing(false)
        return
      }
      const detected = autoDetectMapping(parsed.headers)
      const objects = rowsToObjects(parsed.headers, parsed.rows)
      const validated = validateAllRows(objects, detected, existingIds || undefined)
      setParsedFile(parsed)
      setMapping(detected)
      setValidatedRows(validated)
      setStep('mapping')
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao processar arquivo')
    } finally {
      setParsing(false)
    }
  }

  const handleMappingChange = (newMapping: Record<string, string>) => {
    if (!parsedFile) return
    setMapping(newMapping)
    const objects = rowsToObjects(parsedFile.headers, parsedFile.rows)
    const validated = validateAllRows(objects, newMapping, existingIds || undefined)
    setValidatedRows(validated)
  }

  const handleImport = async () => {
    setStep('importing')
    setProgress({ current: 0, total: validatedRows.length })
    try {
      const result = await importMovimentos(
        validatedRows,
        (current, total) => {
          setProgress({ current, total })
        },
        existingIdmMap || undefined,
      )
      setSummary(result)
      setStep('results')
    } catch (err: any) {
      toast.error(err?.message || 'Erro durante importação')
      setStep('mapping')
    }
  }

  const handleClearData = async () => {
    if (!window.confirm('Tem certeza? Todos os registros de movimentos serão excluídos.')) return
    setClearing(true)
    try {
      await clearMovimentos()
      toast.success('Dados limpos com sucesso')
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao limpar dados')
    } finally {
      setClearing(false)
    }
  }

  const handleReset = () => {
    setStep('upload')
    setParsedFile(null)
    setMapping({})
    setValidatedRows([])
    setSummary(null)
    setProgress({ current: 0, total: 0 })
  }

  const validCount = validatedRows.filter((r) => r.isValid).length
  const invalidCount = validatedRows.length - validCount

  if (step === 'upload') {
    return (
      <div className="flex flex-col gap-2 h-full">
        <div className="flex items-center justify-between shrink-0">
          <h2 className="text-sm font-bold text-yg-dark">Importar Movimentos</h2>
          <div className="flex gap-1">
            <Button
              onClick={handleClearData}
              disabled={clearing}
              className="h-[28px] text-[11px] font-bold bg-red-600 hover:bg-red-700"
            >
              {clearing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              Limpar Dados
            </Button>
            <Button
              onClick={downloadImportTemplate}
              className="h-[28px] text-[11px] font-bold bg-yg-dark hover:bg-blue-800"
            >
              <Download className="w-3.5 h-3.5" /> Baixar Modelo
            </Button>
          </div>
        </div>
        <p className="text-[11px] text-gray-600">
          Selecione um arquivo CSV ou XLSX com os dados de movimentos para importação em lote.
        </p>
        <FileUpload onFileSelected={handleFileSelected} loading={parsing} />
      </div>
    )
  }

  if (step === 'mapping') {
    return (
      <div className="flex flex-col gap-2 h-full">
        <div className="flex items-center justify-between shrink-0">
          <h2 className="text-sm font-bold text-yg-dark">Mapear Colunas</h2>
          <span className="text-[11px] text-gray-500">
            {parsedFile?.rows.length || 0} linhas | {parsedFile?.headers.length || 0} colunas
          </span>
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          <ColumnMapping
            headers={parsedFile?.headers || []}
            mapping={mapping}
            onMappingChange={handleMappingChange}
            validCount={validCount}
            invalidCount={invalidCount}
          />
        </div>
        <div className="flex gap-1 shrink-0">
          <button
            onClick={handleReset}
            className="h-[26px] px-3 bg-gray-300 border border-gray-500 text-black text-[11px] font-bold hover:bg-gray-400 transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" /> Voltar
          </button>
          <button
            onClick={handleImport}
            disabled={validCount === 0}
            className="flex-1 h-[26px] bg-yg-dark text-white text-[11px] font-bold hover:bg-blue-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-1"
          >
            Importar {validCount} registro{validCount !== 1 ? 's' : ''}
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    )
  }

  if (step === 'importing') {
    const pct = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0
    return (
      <div className="flex flex-col items-center justify-center gap-4 h-full">
        <Loader2 className="w-8 h-8 text-yg-royal animate-spin" />
        <p className="text-sm font-bold text-yg-dark">Importando registros...</p>
        <div className="w-full max-w-[400px]">
          <div className="h-[20px] bg-gray-200 border border-gray-400 overflow-hidden">
            <div
              className="h-full bg-yg-royal transition-all duration-200"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-center text-[11px] text-gray-500 mt-1">
            {progress.current} / {progress.total} ({pct}%)
          </p>
        </div>
      </div>
    )
  }

  if (step === 'results' && summary) {
    return (
      <div className="flex flex-col gap-2 h-full">
        <h2 className="text-sm font-bold text-yg-dark shrink-0">Resultado da Importação</h2>
        <div className="flex-1 min-h-0 overflow-auto yg-scrollbar">
          <ImportResults summary={summary} onReset={handleReset} />
        </div>
      </div>
    )
  }

  return null
}
