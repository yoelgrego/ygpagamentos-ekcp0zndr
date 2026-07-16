import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ open, message, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-md p-0 gap-0 bg-yg-bg border-yg-dark rounded-none">
        <DialogHeader className="bg-yg-dark text-white p-2">
          <DialogTitle className="text-sm font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yg-gold" />
            Confirmação
          </DialogTitle>
        </DialogHeader>
        <div className="p-4 text-sm text-black">{message}</div>
        <div className="flex justify-end gap-2 p-2 border-t border-gray-300">
          <button
            onClick={onCancel}
            className="px-4 py-1 bg-gray-300 text-black text-xs font-bold hover:bg-gray-400 transition-colors"
          >
            Não
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-1 bg-yg-dark text-white text-xs font-bold hover:bg-blue-800 transition-colors"
          >
            Sim
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
