import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { useResizableColumns } from '@/hooks/use-resizable-columns'
import { useRealtime } from '@/hooks/use-realtime'
import { getObjetos, type ObjetoRecord } from '@/services/objeto'

const OBJETO_COL_DEFS = ['Id', 'NObj', 'Descr']
const OBJETO_INITIAL_WIDTHS = [60, 150, 280]

export function ObjetoGrid() {
  const [objetos, setObjetos] = useState<ObjetoRecord[]>([])

  const { colWidths, onResizeStart } = useResizableColumns({
    initialWidths: OBJETO_INITIAL_WIDTHS,
    minWidth: 40,
    maxWidth: 600,
  })

  const loadData = useCallback(async () => {
    try {
      const data = await getObjetos()
      setObjetos(data)
    } catch (err) {
      console.error('Failed to load objetos:', err)
      setObjetos([])
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('06objeto', () => {
    loadData()
  })

  const totalWidth = colWidths.reduce((a, b) => a + b, 0)

  return (
    <div className="flex flex-col">
      <div
        className="h-[80px] overflow-auto yg-scrollbar border border-gray-400 bg-white shadow-inner"
        style={{ touchAction: 'pan-y' }}
      >
        <table
          className="text-[11px] text-left border-collapse"
          style={{ tableLayout: 'fixed', width: totalWidth }}
        >
          <colgroup>
            {colWidths.map((cw, i) => (
              <col key={i} style={{ width: cw }} />
            ))}
          </colgroup>
          <thead className="bg-yg-dark text-white sticky top-0 z-20">
            <tr>
              {OBJETO_COL_DEFS.map((col, i) => (
                <th
                  key={col}
                  className={cn(
                    'font-bold p-1 px-2 border-r border-white/20 relative select-none',
                    i === 0 && 'sticky left-0 z-30 bg-yg-dark',
                  )}
                >
                  <span className="block overflow-hidden text-ellipsis whitespace-nowrap">
                    {col}
                  </span>
                  {i < OBJETO_COL_DEFS.length - 1 && (
                    <div
                      className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-white/50 active:bg-white/70 transition-colors duration-150 touch-none z-40"
                      onMouseDown={onResizeStart(i)}
                      onTouchStart={onResizeStart(i)}
                    />
                  )}{' '}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {objetos.map((row) => {
              const cells = [row.idobj, row.nobj, row.descr]
              return (
                <tr
                  key={row.id}
                  className="group border-b border-gray-200 hover:bg-sky-100 cursor-pointer"
                >
                  {cells.map((cell, i) => (
                    <td
                      key={i}
                      className={cn(
                        'p-1 px-2 border-r overflow-hidden text-ellipsis whitespace-nowrap',
                        i === 0 && 'sticky left-0 z-10 bg-white group-hover:bg-sky-100',
                      )}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              )
            })}
            {[...Array(5)].map((_, i) => (
              <tr key={`obj-empty-${i}`} className="border-b border-gray-200 h-[24px]">
                {[...Array(3)].map((_, j) => (
                  <td
                    key={j}
                    className={cn('border-r', j === 0 && 'sticky left-0 z-10 bg-white')}
                  ></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
