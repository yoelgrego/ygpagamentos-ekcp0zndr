import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertTriangle } from 'lucide-react'

interface ValidationDialogProps {
  open: boolean
  message: string
  onClose: () => void
}

export function ValidationDialog({ open, message, onClose }: ValidationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md p-0 gap-0 bg-yg-bg border-yg-dark rounded-none">
        <DialogHeader className="bg-yg-dark text-white p-2">
          <DialogTitle className="text-sm font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yg-gold" />
            Aviso
          </DialogTitle>
        </DialogHeader>
        <div className="p-4 text-sm text-black">{message}</div>
        <div className="flex justify-end p-2 border-t border-gray-300">
          <button
            onClick={onClose}
            className="px-4 py-1 bg-yg-dark text-white text-xs font-bold hover:bg-blue-800 transition-colors"
          >
            OK
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
