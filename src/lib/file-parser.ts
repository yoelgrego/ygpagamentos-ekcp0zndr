export interface ParsedFile {
  headers: string[]
  rows: string[][]
}

export async function parseFile(file: File): Promise<ParsedFile> {
  const name = file.name.toLowerCase()
  if (name.endsWith('.csv') || name.endsWith('.txt')) return parseCSV(file)
  if (name.endsWith('.xlsx')) return parseXLSX(file)
  if (name.endsWith('.xls')) throw new Error('Formato .xls não suportado. Use .csv ou .xlsx.')
  throw new Error('Formato não suportado. Use .csv ou .xlsx.')
}

async function parseCSV(file: File): Promise<ParsedFile> {
  const text = await file.text()
  const delim = detectDelimiter(text)
  const rows = parseCSVText(text, delim)
  if (rows.length === 0) return { headers: [], rows: [] }
  return { headers: rows[0], rows: rows.slice(1) }
}

function detectDelimiter(text: string): string {
  const line = text.split('\n')[0] || ''
  const sc = (line.match(/;/g) || []).length
  const cm = (line.match(/,/g) || []).length
  const tb = (line.match(/\t/g) || []).length
  if (sc > cm && sc > tb) return ';'
  if (tb > cm && tb > sc) return '\t'
  return ','
}

function parseCSVText(text: string, delim: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  let i = 0
  while (i < text.length) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i += 2
          continue
        }
        inQuotes = false
        i++
        continue
      }
      field += ch
      i++
      continue
    }
    if (ch === '"') {
      inQuotes = true
      i++
      continue
    }
    if (ch === delim) {
      row.push(field.trim())
      field = ''
      i++
      continue
    }
    if (ch === '\r') {
      i++
      continue
    }
    if (ch === '\n') {
      row.push(field.trim())
      rows.push(row)
      row = []
      field = ''
      i++
      continue
    }
    field += ch
    i++
  }
  if (field || row.length > 0) {
    row.push(field.trim())
    rows.push(row)
  }
  return rows.filter((r) => r.some((c) => c !== ''))
}

async function parseXLSX(file: File): Promise<ParsedFile> {
  const buf = await file.arrayBuffer()
  const entries = await readZipEntries(buf)
  const sharedStrings: string[] = []
  const ssData = entries.get('xl/sharedStrings.xml')
  if (ssData) {
    const doc = new DOMParser().parseFromString(new TextDecoder().decode(ssData), 'text/xml')
    doc.querySelectorAll('si').forEach((si) => {
      sharedStrings.push(
        Array.from(si.querySelectorAll('t'))
          .map((t) => t.textContent || '')
          .join(''),
      )
    })
  }
  const sheetData = entries.get('xl/worksheets/sheet1.xml')
  if (!sheetData) throw new Error('Planilha não encontrada no arquivo.')
  const doc = new DOMParser().parseFromString(new TextDecoder().decode(sheetData), 'text/xml')
  const rows: string[][] = []
  doc.querySelectorAll('row').forEach((rowEl) => {
    const cells: string[] = []
    let maxCol = -1
    rowEl.querySelectorAll('c').forEach((cell) => {
      const ref = cell.getAttribute('r') || ''
      const colMatch = ref.match(/([A-Z]+)/)
      if (!colMatch) return
      const colIdx = colStrToIndex(colMatch[1])
      maxCol = Math.max(maxCol, colIdx)
      const type = cell.getAttribute('t')
      const v = cell.querySelector('v')
      const raw = v?.textContent || ''
      let val = ''
      if (type === 's') val = sharedStrings[parseInt(raw)] || ''
      else if (type === 'inlineStr') {
        const t = cell.querySelector('t')
        val = t?.textContent || ''
      } else val = raw
      while (cells.length < colIdx) cells.push('')
      cells[colIdx] = val
    })
    while (cells.length <= maxCol) cells.push('')
    rows.push(cells)
  })
  if (rows.length === 0) return { headers: [], rows: [] }
  return { headers: rows[0], rows: rows.slice(1) }
}

function colStrToIndex(s: string): number {
  let idx = 0
  for (let i = 0; i < s.length; i++) idx = idx * 26 + (s.charCodeAt(i) - 64)
  return idx - 1
}

async function readZipEntries(data: ArrayBuffer): Promise<Map<string, Uint8Array>> {
  const view = new DataView(data)
  const entries = new Map<string, Uint8Array>()
  let offset = 0
  while (offset < data.byteLength - 4) {
    const sig = view.getUint32(offset, true)
    if (sig !== 0x04034b50) break
    const method = view.getUint16(offset + 8, true)
    const compSize = view.getUint32(offset + 18, true)
    const nameLen = view.getUint16(offset + 26, true)
    const extraLen = view.getUint16(offset + 28, true)
    const name = new TextDecoder().decode(new Uint8Array(data, offset + 30, nameLen))
    const dataOffset = offset + 30 + nameLen + extraLen
    if (method === 0) entries.set(name, new Uint8Array(data, dataOffset, compSize))
    else if (method === 8)
      entries.set(name, await inflate(new Uint8Array(data, dataOffset, compSize)))
    offset = dataOffset + compSize
  }
  return entries
}

async function inflate(data: Uint8Array): Promise<Uint8Array> {
  if (typeof DecompressionStream === 'undefined') {
    throw new Error('Navegador não suporta leitura de XLSX. Use formato CSV.')
  }
  const stream = new ReadableStream({
    start(ctrl) {
      ctrl.enqueue(data)
      ctrl.close()
    },
  })
  const dec = stream.pipeThrough(new DecompressionStream('deflate-raw'))
  const reader = dec.getReader()
  const chunks: Uint8Array[] = []
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    if (value) chunks.push(value)
  }
  const total = chunks.reduce((s, c) => s + c.length, 0)
  const result = new Uint8Array(total)
  let pos = 0
  for (const c of chunks) {
    result.set(c, pos)
    pos += c.length
  }
  return result
}
