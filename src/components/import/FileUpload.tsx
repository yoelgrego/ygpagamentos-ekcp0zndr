import { useState, useRef } from 'react'
import { Upload, FileSpreadsheet } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onFileSelected: (file: File) => void
  loading?: boolean
}

export function FileUpload({ onFileSelected, loading }: FileUploadProps) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) onFileSelected(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = () => setDragging(false)

  const handleClick = () => inputRef.current?.click()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFileSelected(file)
  }

  return (
    <div
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        'flex flex-col items-center justify-center gap-2 border-2 border-dashed cursor-pointer transition-colors duration-200 p-8 min-h-[200px]',
        dragging
          ? 'border-yg-royal bg-blue-50'
          : 'border-gray-400 hover:border-yg-royal hover:bg-gray-50',
      )}
    >
      {loading ? (
        <>
          <div className="w-8 h-8 border-2 border-yg-royal border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-yg-dark">Processando arquivo...</p>
        </>
      ) : (
        <>
          {dragging ? (
            <FileSpreadsheet className="w-10 h-10 text-yg-royal" />
          ) : (
            <Upload className="w-10 h-10 text-gray-400" />
          )}
          <p className="text-sm font-semibold text-yg-dark">
            {dragging ? 'Solte o arquivo aqui' : 'Clique ou arraste um arquivo'}
          </p>
          <p className="text-[11px] text-gray-500">Formatos: .csv, .xlsx</p>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  )
}
