export const TEMPLATE_HEADERS = [
  'idm',
  'ano',
  'mes',
  'dia',
  'idfornece',
  'idbenef',
  'idmoeda',
  'valor',
  'idtipo',
  'card',
  'idpaga',
  'idcat',
  'idnat',
  'pago',
]

export function downloadImportTemplate(): void {
  const sampleRow = [
    '1001',
    '2024',
    '6',
    '15',
    '1',
    '1',
    '1',
    '150.50',
    '1',
    '0',
    '1',
    '1',
    '1',
    'S',
  ]
  const csv = [TEMPLATE_HEADERS.join(','), sampleRow.join(',')].join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'modelo_movimentos.csv'
  a.click()
  URL.revokeObjectURL(url)
}
