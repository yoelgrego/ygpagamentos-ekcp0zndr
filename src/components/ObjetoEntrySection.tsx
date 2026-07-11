import { useState } from 'react'
import { YgLabel, YgInput, YgButton, YgFieldGroup } from '@/components/yg-ui'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAppStore } from '@/stores/use-app-store'
import { useResizableColumns } from '@/hooks/use-resizable-columns'
import { Plus, Trash2, X } from 'lucide-react'

interface PendingObj {
  idobj: string
  idobjNum: number
  nobj: string
}

const w = (chars: number) => `${chars * 8 + 12}px`

const OBJETO_COL_DEFS = ['Id', 'NObj']
const INITIAL_OBJ_WIDTHS = [50, 400]

export function ObjetoEntrySection() {
  const { objetos } = useAppStore()
  const [items, setItems] = useState<PendingObj[]>([])
  const [selectedObj, setSelectedObj] = useState<PendingObj | null>(null)
  const [lookupOpen, setLookupOpen] = useState(false)

  const { colWidths, onResizeStart } = useResizableColumns({
    initialWidths: INITIAL_OBJ_WIDTHS,
    minWidth: 40,
    maxWidth: 1200,
  })

  const handleAdd = () => {
    if (!selectedObj) return
    setItems((prev) => [...prev, { ...selectedObj }])
    setSelectedObj(null)
  }

  const handleNovo = () => {
    setSelectedObj(null)
  }

  const handleClear = () => {
    setItems([])
    setSelectedObj(null)
  }

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSelectObj = (row: any) => {
    setSelectedObj({
      idobj: row.id,
      idobjNum: row.idobj,
      nobj: row.nobj,
    })
    setLookupOpen(false)
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-2 items-end flex-wrap">
        <YgFieldGroup>
          <YgLabel>Objeto</YgLabel>
          <div className="flex">
            <YgInput
              style={{ width: w(4) }}
              value={selectedObj?.idobjNum?.toString() || ''}
              readOnly
            />
            <YgButton onClick={() => setLookupOpen(true)}>?</YgButton>
            <YgInput
              style={{ width: w(20) }}
              value={selectedObj?.nobj || ''}
              readOnly
              className="bg-gray-50 ml-1"
            />
          </div>
        </YgFieldGroup>
        <div className="flex gap-1 pb-[1px]">
          <button
            onClick={handleNovo}
            className="h-[22px] px-2 bg-gray-300 border border-gray-500 text-black text-[11px] font-bold flex items-center gap-1 hover:bg-gray-400 rounded-none"
          >
            Novo
          </button>
          <button
            onClick={handleAdd}
            className="h-[22px] px-2 bg-yg-dark text-white text-[11px] font-bold flex items-center gap-1 hover:bg-blue-800 rounded-none"
          >
            <Plus className="w-2.5 h-2.5" /> Adicionar
          </button>
          <button
            onClick={handleClear}
            className="h-[22px] px-2 bg-gray-300 border border-gray-500 text-black text-[11px] font-bold flex items-center gap-1 hover:bg-gray-400 rounded-none"
          >
            <Trash2 className="w-2.5 h-2.5" /> Limpar
          </button>
        </div>
      </div>

      <div className="h-[80px] overflow-auto yg-scrollbar border border-gray-400 bg-white shadow-inner">
        <table
          className="text-[11px] text-left border-collapse"
          style={{ tableLayout: 'fixed', width: colWidths.reduce((a, b) => a + b, 0) + 24 }}
        >
          <colgroup>
            {colWidths.map((cw, i) => (
              <col key={i} style={{ width: cw }} />
            ))}
            <col style={{ width: 24 }} />
          </colgroup>
          <thead className="bg-yg-dark text-white sticky top-0">
            <tr>
              {OBJETO_COL_DEFS.map((col, i) => (
                <th key={col} className="font-bold p-1 border-r border-white/20 relative">
                  <span className="block overflow-hidden text-ellipsis whitespace-nowrap">
                    {col}
                  </span>
                  {i < OBJETO_COL_DEFS.length - 1 && (
                    <div
                      className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-white/40 active:bg-white/70 transition-colors duration-150 touch-none"
                      onMouseDown={onResizeStart(i)}
                      onTouchStart={onResizeStart(i)}
                    />
                  )}
                </th>
              ))}
              <th className="font-bold p-1"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b border-gray-200 hover:bg-sky-50">
                <td className="p-1 border-r truncate">{item.idobjNum}</td>
                <td className="p-1 border-r truncate">{item.nobj}</td>
                <td className="p-1 text-center">
                  <button
                    onClick={() => handleRemoveItem(i)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={3} className="p-1 text-center text-gray-400 text-[10px]">
                  Nenhum item adicionado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={lookupOpen} onOpenChange={setLookupOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0 gap-0 bg-yg-bg border-yg-dark rounded-none">
          <DialogHeader className="bg-yg-dark text-white p-2">
            <DialogTitle className="text-sm font-bold">Selecionar Objeto</DialogTitle>
          </DialogHeader>
          <div className="p-4 overflow-auto yg-scrollbar bg-white">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="p-1 border border-gray-300 font-bold">ID</th>
                  <th className="p-1 border border-gray-300 font-bold">NObj</th>
                </tr>
              </thead>
              <tbody>
                {objetos.map((row: any) => (
                  <tr
                    key={row.id}
                    className="hover:bg-blue-100 cursor-pointer"
                    onClick={() => handleSelectObj(row)}
                  >
                    <td className="p-1 border">{row.idobj}</td>
                    <td className="p-1 border">{row.nobj}</td>
                  </tr>
                ))}
                {objetos.length === 0 && (
                  <tr>
                    <td colSpan={2} className="p-4 text-center text-gray-500">
                      Nenhum registro encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
