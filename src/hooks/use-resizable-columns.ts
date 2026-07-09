import { useState, useCallback, useEffect, useRef } from 'react'

interface UseResizableColumnsOptions {
  initialWidths: number[]
  minWidth?: number
  maxWidth?: number
}

export function useResizableColumns({
  initialWidths,
  minWidth = 40,
  maxWidth = 600,
}: UseResizableColumnsOptions) {
  const [colWidths, setColWidths] = useState<number[]>(initialWidths)
  const resizeRef = useRef<{
    index: number
    startX: number
    startWidths: number[]
  } | null>(null)

  const onResizeStart = useCallback(
    (index: number) => (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault()
      e.stopPropagation()
      let clientX: number
      if ('touches' in e) {
        if (e.touches.length === 0) return
        clientX = e.touches[0].clientX
      } else {
        clientX = (e as React.MouseEvent).clientX
      }
      resizeRef.current = {
        index,
        startX: clientX,
        startWidths: [...colWidths],
      }
    },
    [colWidths],
  )

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!resizeRef.current) return
      e.preventDefault()
      let clientX: number
      if ('touches' in e) {
        if (e.touches.length === 0) return
        clientX = e.touches[0].clientX
      } else {
        clientX = (e as MouseEvent).clientX
      }
      const { index, startX, startWidths } = resizeRef.current
      const rightIndex = index + 1
      if (rightIndex >= startWidths.length) return
      const delta = clientX - startX
      let newLeft = startWidths[index] + delta
      let newRight = startWidths[rightIndex] - delta
      if (newLeft < minWidth) {
        newRight -= minWidth - newLeft
        newLeft = minWidth
      }
      if (newRight < minWidth) {
        newLeft -= minWidth - newRight
        newRight = minWidth
      }
      newLeft = Math.min(newLeft, maxWidth)
      newRight = Math.min(newRight, maxWidth)
      const newWidths = [...startWidths]
      newWidths[index] = newLeft
      newWidths[rightIndex] = newRight
      setColWidths(newWidths)
    }

    const handleEnd = () => {
      resizeRef.current = null
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleEnd)
    window.addEventListener('touchmove', handleMove, { passive: false })
    window.addEventListener('touchend', handleEnd)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleEnd)
      window.removeEventListener('touchmove', handleMove)
      window.removeEventListener('touchend', handleEnd)
    }
  }, [minWidth, maxWidth])

  const resetWidths = useCallback(() => {
    setColWidths(initialWidths)
  }, [initialWidths])

  return { colWidths, onResizeStart, resetWidths }
}
