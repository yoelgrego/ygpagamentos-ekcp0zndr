import { useState, useRef, useEffect, useCallback } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'

export function useResizableColumns(initialWidths: number[], minWidth = 40) {
  const [widths, setWidths] = useState<number[]>(initialWidths)
  const dragRef = useRef<{ index: number; startX: number; startW: number } | null>(null)

  const onResizeStart = useCallback(
    (index: number) => (e: ReactMouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      dragRef.current = { index, startX: e.clientX, startW: widths[index] }
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    },
    [widths],
  )

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return
      const { index, startX, startW } = dragRef.current
      const newW = Math.max(minWidth, startW + (e.clientX - startX))
      setWidths((prev) => {
        const next = [...prev]
        next[index] = newW
        return next
      })
    }
    const onUp = () => {
      if (dragRef.current) {
        dragRef.current = null
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
  }, [minWidth])

  return { widths, onResizeStart }
}
