import { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import pb from '@/lib/pocketbase/client'
import { ValidationDialog } from '@/components/ValidationDialog'

export interface EntityConfig {
  collection: string
  idField: string
  nameField: string
  title: string
}

export interface EntitySearchModalProps {
  open: boolean
  onClose: () => void
  onSelect: (record: { codigo: string; valor: string }) => void
  config: EntityConfig
}

export function EntitySearchModal({ open, onClose, onSelect, config }: EntitySearchModalProps) {
  const [filterId, setFilterId] = useState('')
  const [filterName, setFilterName] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [selectedRow, setSelectedRow] = useState<any>(null)
  const [newId, setNewId] = useState('')
  const [newName, setNewName] = useState('')
  const [loading, setLoading] = useState(false)
  const [validationOpen, setValidationOpen] = useState(false)
  const [validationMsg, setValidationMsg] = useState('')
  const newNameRef = useRef<HTMLInputElement>(null)
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    if (open) {
      setFilterId('')
      setFilterName('')
      setResults([])
      setSelectedRow(null)
      setNewId('')
      setNewName('')
      setHasSearched(false)
    }
  }, [open])

  const handleConsultar = async () => {
    setLoading(true)
    setHasSearched(true)
    try {
      let filter = ''
      if (filterId) {
        filter = `${config.idField} = ${filterId}`
      }
      if (filterName) {
        filter += (filter ? ' && ' : '') + `${config.nameField} ~ "${filterName}"`
      }

      let records = await pb
        .collection(config.collection)
        .getFullList({ filter, sort: config.nameField })

      if (filterName) {
        const lowerFilter = filterName.toLowerCase()
        records = records.filter((r) =>
          String(r[config.nameField] || '')
            .toLowerCase()
            .startsWith(lowerFilter),
        )
      }

      setResults(records)
      setSelectedRow(null)
    } catch {
      toast.error('Erro ao consultar registros')
    } finally {
      setLoading(false)
    }
  }

  const handleNovo = async () => {
    setNewName('')
    setLoading(true)
    try {
      const records = await pb
        .collection(config.collection)
        .getFullList({ sort: `-${config.idField}` })
      const maxId = records.length > 0 ? records[0][config.idField] : 0
      setNewId((maxId + 1).toString())
    } catch {
      toast.error('Erro ao gerar novo ID')
    } finally {
      setLoading(false)
    }
  }

  const handleGravar = async () => {
    let targetId = newId
    if (!targetId) {
      setLoading(true)
      try {
        const records = await pb
          .collection(config.collection)
          .getFullList({ sort: `-${config.idField}` })
        const maxId = records.length > 0 ? records[0][config.idField] : 0
        targetId = (maxId + 1).toString()
        setNewId(targetId)
      } catch {
        toast.error('Erro ao gerar novo ID')
        setLoading(false)
        return
      }
    }

    if (!newName.trim()) {
      setLoading(false)
      setValidationMsg(`Nome do ${config.title} é OBRIGATÓRIO`)
      setValidationOpen(true)
      return
    }

    setLoading(true)
    try {
      const existing = await pb
        .collection(config.collection)
        .getFullList({ filter: `${config.idField} = ${targetId}` })
      if (existing.length > 0) {
        toast.error('O código informado já existe')
        setLoading(false)
        return
      }

      await pb.collection(config.collection).create({
        [config.idField]: parseInt(targetId),
        [config.nameField]: newName.trim(),
      })
      toast.success(`${config.title} gravado com sucesso`)

      await handleConsultar()

      const newRecords = await pb
        .collection(config.collection)
        .getFullList({ filter: `${config.idField} = ${targetId}` })
      if (newRecords.length > 0) setSelectedRow(newRecords[0])

      setNewId('')
      setNewName('')
    } catch {
      toast.error(`Erro ao gravar ${config.title}`)
    } finally {
      setLoading(false)
    }
  }

  const handleValidationClose = () => {
    setValidationOpen(false)
    setTimeout(() => newNameRef.current?.focus(), 50)
  }

  const handleSelecionar = () => {
    if (selectedRow) {
      onSelect({
        codigo: String(selectedRow[config.idField]),
        valor: selectedRow[config.nameField],
      })
    } else if (filterId && filterName) {
      onSelect({ codigo: filterId, valor: filterName })
    } else {
      toast.error('Selecione um registro ou preencha os filtros para selecionar')
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent
          className="max-w-3xl p-0 gap-0 bg-gray-100 border-slate-800 rounded-md overflow-hidden flex flex-col"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="bg-[#1A2B4C] text-white p-3 flex-shrink-0">
            <DialogTitle className="text-base font-semibold">
              YGPagamentos - {config.title}
            </DialogTitle>
          </DialogHeader>

          {loading && (
            <div className="absolute inset-0 bg-gray-500/50 z-50 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
            </div>
          )}

          <div className="p-4 bg-white flex flex-col gap-4 flex-1 overflow-hidden">
            <div className="flex gap-4 items-end border-b pb-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">ID</label>
                <input
                  value={filterId}
                  onChange={(e) => setFilterId(e.target.value.replace(/\D/g, ''))}
                  className="w-24 border p-1 text-sm focus:outline-none focus:border-teal-600 rounded-sm"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-700 mb-1">Nome</label>
                <input
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  className="w-full border p-1 text-sm focus:outline-none focus:border-teal-600 rounded-sm"
                />
              </div>
              <button
                onClick={handleConsultar}
                className="px-6 py-1.5 bg-teal-600 text-white font-bold rounded-full shadow hover:bg-teal-700 text-sm h-[30px] flex items-center justify-center transition-colors"
              >
                Consultar
              </button>
            </div>

            <div className="flex-1 overflow-auto border border-gray-300 rounded-sm min-h-[200px] max-h-[300px] bg-white">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-gray-500 text-white sticky top-0 z-10">
                  <tr>
                    <th className="p-2 border-r border-white/20 w-12 text-center"></th>
                    <th className="p-2 border-r border-white/20 w-24">ID</th>
                    <th className="p-2">Nome</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedRow(r)}
                      onDoubleClick={() => {
                        setFilterId(String(r[config.idField]))
                        setFilterName(r[config.nameField])
                      }}
                      className={`cursor-pointer border-b border-gray-200 transition-colors ${
                        selectedRow?.id === r.id ? 'bg-sky-100' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="p-2 border-r border-gray-200 text-center">
                        <div
                          className={`w-3 h-3 rounded-full border border-gray-400 mx-auto ${
                            selectedRow?.id === r.id ? 'bg-slate-700 ring-2 ring-white' : 'bg-white'
                          }`}
                        />
                      </td>
                      <td className="p-2 border-r border-gray-200">{r[config.idField]}</td>
                      <td className="p-2">{r[config.nameField]}</td>
                    </tr>
                  ))}
                  {results.length === 0 && hasSearched && (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-gray-500">
                        Nenhum registro encontrado para os filtros informados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="bg-gray-100 p-3 rounded-sm border border-gray-300">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-full bg-gray-400 text-white flex items-center justify-center text-sm font-bold">
                  +
                </div>
                <span className="text-sm font-bold text-gray-800">Novo Parâmetro</span>
              </div>
              <div className="flex gap-4">
                <div className="w-24">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Código</label>
                  <input
                    value={newId}
                    readOnly
                    tabIndex={-1}
                    className="w-full border p-1 bg-white text-sm rounded-sm pointer-events-none select-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Valor/Descrição
                  </label>
                  <input
                    ref={newNameRef}
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full border p-1 text-sm focus:outline-none focus:border-teal-600 rounded-sm bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-2">
              <div className="flex gap-2">
                <button
                  onClick={handleNovo}
                  className="px-6 py-1.5 bg-teal-600 text-white font-bold rounded-full shadow hover:bg-teal-700 text-sm transition-colors"
                >
                  Novo
                </button>
                <button
                  onClick={handleGravar}
                  className="px-6 py-1.5 bg-blue-600 text-white font-bold rounded-full shadow hover:bg-blue-700 text-sm transition-colors"
                >
                  Gravar
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSelecionar}
                  className="px-6 py-1.5 bg-teal-600 text-white font-bold rounded-full shadow hover:bg-teal-700 text-sm transition-colors"
                >
                  Selecionar
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-1.5 bg-white text-gray-700 font-bold rounded-full shadow border border-gray-400 hover:bg-gray-50 text-sm transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ValidationDialog
        open={validationOpen}
        message={validationMsg}
        onClose={handleValidationClose}
      />
    </>
  )
}
