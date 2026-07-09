import { IMPORT_FIELDS } from '@/lib/import-validation'
import { cn } from '@/lib/utils'

interface ColumnMappingProps {
  headers: string[]
  mapping: Record<string, string>
  onMappingChange: (mapping: Record<string, string>) => void
  validCount: number
  invalidCount: number
}

export function ColumnMapping({
  headers,
  mapping,
  onMappingChange,
  validCount,
  invalidCount,
}: ColumnMappingProps) {
  const handleChange = (fieldKey: string, value: string) => {
    onMappingChange({ ...mapping, [fieldKey]: value || '' })
  }

  return (
    <div className="flex flex-col gap-2 overflow-auto yg-scrollbar h-full">
      <div className="flex gap-4 text-[12px] shrink-0">
        <span className="text-green-600 font-semibold">✓ Válidas: {validCount}</span>
        <span className="text-red-600 font-semibold">✗ Inválidas: {invalidCount}</span>
      </div>
      <div className="border border-gray-400 bg-white overflow-auto yg-scrollbar flex-1 min-h-0">
        <table className="w-full text-[11px] border-collapse">
          <thead className="bg-yg-dark text-white sticky top-0">
            <tr>
              <th className="p-1 px-2 text-left border-r border-white/20">Campo BD</th>
              <th className="p-1 px-2 text-left border-r border-white/20">Descrição</th>
              <th className="p-1 px-2 text-left border-r border-white/20">Coluna Arquivo</th>
              <th className="p-1 px-2 text-left">Obrigatório</th>
            </tr>
          </thead>
          <tbody>
            {IMPORT_FIELDS.map((field) => (
              <tr key={field.key} className="border-b border-gray-200">
                <td className="p-1 px-2 font-mono font-bold text-yg-dark">{field.key}</td>
                <td className="p-1 px-2 text-gray-600">{field.label}</td>
                <td className="p-1 px-2">
                  <select
                    value={mapping[field.key] || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="w-full h-[20px] text-[11px] border border-gray-400 bg-white px-1 focus:outline-none focus:border-yg-royal"
                  >
                    <option value="">— não mapear —</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </td>
                <td
                  className={cn(
                    'p-1 px-2',
                    field.required ? 'text-red-600 font-bold' : 'text-gray-400',
                  )}
                >
                  {field.required ? 'Sim' : 'Não'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
