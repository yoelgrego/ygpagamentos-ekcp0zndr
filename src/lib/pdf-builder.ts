function toWinAnsi(str: string): string {
  const map: Record<number, number> = {
    0x2013: 0x96,
    0x2014: 0x97,
    0x2018: 0x91,
    0x2019: 0x92,
    0x201c: 0x93,
    0x201d: 0x94,
    0x2026: 0x85,
    0x20ac: 0x80,
    0x2022: 0x95,
  }
  let r = ''
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i)
    r += c <= 0xff ? str[i] : String.fromCharCode(map[c] ?? 0x3f)
  }
  return r
}

function encodeLatin1(str: string): Uint8Array {
  const s = toWinAnsi(str)
  const bytes = new Uint8Array(s.length)
  for (let i = 0; i < s.length; i++) bytes[i] = s.charCodeAt(i) & 0xff
  return bytes
}

function textWidth(text: string, fontSize: number, bold: boolean): number {
  return text.length * fontSize * (bold ? 0.55 : 0.5)
}

export function truncateText(
  text: string,
  maxWidth: number,
  fontSize: number,
  bold: boolean,
): string {
  const charW = fontSize * (bold ? 0.55 : 0.5)
  const maxChars = Math.floor(maxWidth / charW)
  if (text.length <= maxChars) return text
  return maxChars > 3 ? text.substring(0, maxChars - 3) + '...' : text.substring(0, maxChars)
}

export class PdfBuilder {
  private pages: string[][] = [[]]
  private readonly pw: number
  private readonly ph: number

  constructor(pw: number, ph: number) {
    this.pw = pw
    this.ph = ph
  }

  get width() {
    return this.pw
  }
  get height() {
    return this.ph
  }

  addPage() {
    this.pages.push([])
  }
  private get cur() {
    return this.pages[this.pages.length - 1]
  }

  text(
    x: number,
    y: number,
    t: string,
    fs: number,
    bold = false,
    align: 'left' | 'center' | 'right' = 'left',
    color: [number, number, number] = [0, 0, 0],
  ) {
    const esc = t.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
    const fn = bold ? 'F2' : 'F1'
    let ax = x
    if (align !== 'left') {
      const tw = textWidth(t, fs, bold)
      ax = align === 'center' ? x - tw / 2 : x - tw
    }
    const [r, g, b] = color.map((c) => (c / 255).toFixed(3))
    this.cur.push(
      `${r} ${g} ${b} rg BT /${fn} ${fs} Tf ${ax.toFixed(1)} ${y.toFixed(1)} Td (${esc}) Tj ET`,
    )
  }

  line(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    lw = 0.5,
    color: [number, number, number] = [0, 0, 0],
  ) {
    const [r, g, b] = color.map((c) => (c / 255).toFixed(3))
    this.cur.push(
      `${r} ${g} ${b} RG ${lw} w ${x1.toFixed(1)} ${y1.toFixed(1)} m ${x2.toFixed(1)} ${y2.toFixed(1)} l S`,
    )
  }

  filledRect(x: number, y: number, w: number, h: number, color: [number, number, number]) {
    const [r, g, b] = color.map((c) => (c / 255).toFixed(3))
    this.cur.push(
      `${r} ${g} ${b} rg ${x.toFixed(1)} ${y.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)} re f`,
    )
  }

  build(): Blob {
    const objs: string[] = []
    objs.push('<< /Type /Catalog /Pages 2 0 R >>')
    const kids = this.pages.map((_, i) => `${5 + 2 * i} 0 R`).join(' ')
    objs.push(`<< /Type /Pages /Kids [${kids}] /Count ${this.pages.length} >>`)
    objs.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>')
    objs.push(
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
    )
    this.pages.forEach((page, i) => {
      const content = page.join('\n')
      objs.push(
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${this.pw} ${this.ph}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${6 + 2 * i} 0 R >>`,
      )
      objs.push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`)
    })
    let pdf = '%PDF-1.4\n'
    const offsets: number[] = []
    objs.forEach((obj, i) => {
      offsets.push(pdf.length)
      pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`
    })
    const xrefOffset = pdf.length
    pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`
    offsets.forEach((o) => {
      pdf += `${o.toString().padStart(10, '0')} 00000 n \n`
    })
    pdf += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
    return new Blob([encodeLatin1(pdf)], { type: 'application/pdf' })
  }
}
