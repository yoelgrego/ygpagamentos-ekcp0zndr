import { useState, useRef } from 'react'
import type { RefObject } from 'react'
import { YgLabel, YgInput, YgButton, YgFieldGroup } from '@/components/yg-ui'
import { useAppStore } from '@/stores/use-app-store'
import { useResizableColumns } from '@/hooks/use-resizable-columns'
import { Plus, Trash2, X } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { EntitySearchModal } from '@/components/EntitySearchModal'
import { ENTITY_CONFIGS } from '@/lib/entity-config'
import { ValidationDialog } from '@/components/ValidationDialog'
import { numericOnly } from '@/lib/date-validation'

export interface PendingObj {
  idobj: string
  idobjNum: number
  nobj: string
}

interface ObjetoEntrySectionProps {
  items: PendingObj[]
  onItemsChange: (items: PendingObj[]) => void
}

const w = (chars: number) => `${chars * 8 + 12}px`

const OBJETO_COL_DEFS = ['Id', 'NObj']
const INITIAL_OBJ_WIDTHS = [50, 400]

export function ObjetoEntrySection({ items, onItemsChange }: ObjetoEntrySectionProps) {
  const { objetos } = useAppStore()
  const [selectedObj, setSelectedObj] = useState<PendingObj | null>(null)
  const [lookupOpen, setLookupOpen] = useState(false)
  const [validationOpen, setValidationOpen] = useState(false)
  const [validationMsg, setValidationMsg] = useState('')
  const objIdRef = useRef<HTMLInputElement>(null)
  const focusAfterClose = useRef<RefObject<HTMLInputElement> | null>(null)

  const { colWidths, onResizeStart } = useResizableColumns({
    initialWidths: INITIAL_OBJ_WIDTHS,
    minWidth: 40,
    maxWidth: 1200,
  })

  const showValidation = (message: string, ref: RefObject<HTMLInputElement>) => {
    focusAfterClose.current = ref
    setValidationMsg(message)
    setValidationOpen(true)
  }

  const handleValidationClose = () => {
    setValidationOpen(false)
    const ref = focusAfterClose.current
    if (ref) {
      setTimeout(() => ref.current?.focus(), 50)
    }
  }

  const handleObjIdBlur = async () => {
    const val = selectedObj?.idobjNum?.toString() || ''
    if (!val.trim() || val === '0') return
    const num = selectedObj?.idobjNum
    if (!num || isNaN(num)) {
      setSelectedObj(null)
      return
    }
    try {
      const found = await pb.collection('06objeto').getFirstListItem(`idobj = ${num}`)
      setSelectedObj({
        idobj: found.id,
        idobjNum: found.idobj,
        nobj: found.nobj,
      })
    } catch {
      setSelectedObj(null)
      showValidation('Código inválido. Consulte a base de dados usando o botão.', objIdRef)
    }
  }

  const handleObjIdChange = (value: string) => {
    const val = numericOnly(value)
    if (!val) {
      setSelectedObj(null)
      return
    }
    setSelectedObj({ idobj: '', idobjNum: parseInt(val) || 0, nobj: '' })
  }

  const handleAdd = () => {
    if (!selectedObj || !selectedObj.nobj) return
    onItemsChange([...items, { ...selectedObj }])
    setSelectedObj(null)
  }

  const handleNovo = () => {
    setSelectedObj(null)
  }

  const handleClear = () => {
    onItemsChange([])
    setSelectedObj(null)
  }

  const handleRemoveItem = (index: number) => {
    onItemsChange(items.filter((_, i) => i !== index))
  }

  const handleObjetoSelect = async (record: { codigo: string; valor: string }) => {
    const num = parseInt(record.codigo)
    const obj = objetos.find((o: any) => o.idobj === num)
    let objId = obj?.id || ''
    if (!objId) {
      try {
        const found = await pb.collection('06objeto').getFirstListItem(`idobj = ${num}`)
        objId = found.id
      } catch {
        /* id stays empty */
      }
    }
    setSelectedObj({
      idobj: objId,
      idobjNum: num,
      nobj: record.valor,
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
              ref={objIdRef}
              style={{ width: w(4) }}
              value={selectedObj?.idobjNum ? String(selectedObj.idobjNum) : ''}
              onChange={(e) => handleObjIdChange(e.target.value)}
              onBlur={handleObjIdBlur}
            />
            <YgButton onClick={() => setLookupOpen(true)}>?</YgButton>
            <YgInput
              style={{ width: w(20) }}
              value={selectedObj?.nobj || ''}
              readOnly
              tabIndex={-1}
              className="bg-gray-50 ml-1 pointer-events-none select-none"
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

      <EntitySearchModal
        open={lookupOpen}
        onClose={() => setLookupOpen(false)}
        onSelect={handleObjetoSelect}
        config={ENTITY_CONFIGS.objeto}
      />

      <ValidationDialog
        open={validationOpen}
        message={validationMsg}
        onClose={handleValidationClose}
      />
    </div>
  )
}
