import { PdfBuilder, truncateText } from './pdf-builder'

const GRID_COLS = [
  'ID',
  'Ano',
  'Mês',
  'Dia',
  'IdFornece',
  'Fornecedor',
  'IdBenef',
  'Beneficiario',
  'IdMoeda',
  'Moeda',
  'Valor',
  'Cartão',
  'IdTipo',
  'TipoDoc',
  'IdPaga',
  'Pagador',
  'Situação',
  'IdCat',
  'Categoria',
  'IdNat',
  'Natureza',
]

const COL_PROPORTIONS = [
  50, 45, 40, 40, 60, 120, 55, 100, 55, 60, 80, 55, 50, 70, 50, 80, 70, 50, 90, 50, 90,
]

const PAGE_W = 842
const PAGE_H = 595
const MARGIN = 36
const FONT_SIZE = 7
const HEADER_FS = 7
const ROW_H = 14
const HEADER_H = 16
const DARK_BLUE: [number, number, number] = [30, 58, 95]
const LIGHT_GRAY: [number, number, number] = [200, 200, 200]
const WHITE: [number, number, number] = [255, 255, 255]

function rowToCells(row: any): string[] {
  return [
    String(row.idmov ?? ''),
    String(row.ano ?? ''),
    String(row.mes ?? '').padStart(2, '0'),
    String(row.dia ?? '').padStart(2, '0'),
    String(row.idforn ?? ''),
    String(row.fornecedorNome ?? ''),
    String(row.idben ?? ''),
    String(row.beneficiarioNome ?? ''),
    String(row.idmoeda ?? ''),
    String(row.moedaNome ?? ''),
    Number(row.valor ?? 0).toFixed(2),
    String(row.cartao ?? ''),
    String(row.idtipodoc ?? ''),
    String(row.tipoDocNome ?? ''),
    String(row.idpag ?? ''),
    String(row.pagadorNome ?? ''),
    String(row.situacao ?? ''),
    String(row.idcat ?? ''),
    String(row.categoriaNome ?? ''),
    String(row.idnat ?? ''),
    String(row.naturezaNome ?? ''),
  ]
}

export function generateMovementsReport(rows: any[]): void {
  const availW = PAGE_W - 2 * MARGIN
  const totalProp = COL_PROPORTIONS.reduce((a, b) => a + b, 0)
  const colWs = COL_PROPORTIONS.map((p) => (p / totalProp) * availW)

  const pdf = new PdfBuilder(PAGE_W, PAGE_H)

  const titleY = PAGE_H - 50
  pdf.text(PAGE_W / 2, titleY, 'YGPagamentos – Relatório Gerencial', 16, true, 'center')
  const now = new Date()
  const dateStr = now.toLocaleDateString('pt-BR')
  pdf.text(PAGE_W / 2, titleY - 22, dateStr, 12, true, 'center')

  const drawHeader = (topY: number) => {
    pdf.filledRect(MARGIN, topY - HEADER_H, availW, HEADER_H, DARK_BLUE)
    let cx = MARGIN
    for (let i = 0; i < GRID_COLS.length; i++) {
      const t = truncateText(GRID_COLS[i], colWs[i] - 4, HEADER_FS, true)
      pdf.text(cx + 2, topY - 11, t, HEADER_FS, true, 'left', WHITE)
      cx += colWs[i]
    }
    cx = MARGIN
    for (let i = 0; i <= GRID_COLS.length; i++) {
      pdf.line(cx, topY, cx, topY - HEADER_H, 0.5, WHITE)
      if (i < GRID_COLS.length) cx += colWs[i]
    }
  }

  const drawRow = (topY: number, cells: string[]) => {
    let cx = MARGIN
    for (let i = 0; i < cells.length; i++) {
      const t = truncateText(cells[i], colWs[i] - 4, FONT_SIZE, false)
      pdf.text(cx + 2, topY - 10, t, FONT_SIZE)
      cx += colWs[i]
    }
    pdf.line(MARGIN, topY - ROW_H, MARGIN + availW, topY - ROW_H, 0.3, LIGHT_GRAY)
    cx = MARGIN
    for (let i = 0; i <= GRID_COLS.length; i++) {
      pdf.line(cx, topY, cx, topY - ROW_H, 0.3, LIGHT_GRAY)
      if (i < GRID_COLS.length) cx += colWs[i]
    }
  }

  let y = titleY - 50
  let pageNum = 1
  const bottomLimit = MARGIN + 10

  drawHeader(y)
  y -= HEADER_H

  for (const row of rows) {
    if (y - ROW_H < bottomLimit) {
      if (pageNum > 1) {
        pdf.text(PAGE_W - MARGIN, 20, String(pageNum), 9, false, 'right')
      }
      pdf.addPage()
      pageNum++
      y = PAGE_H - MARGIN
      drawHeader(y)
      y -= HEADER_H
    }
    drawRow(y, rowToCells(row))
    y -= ROW_H
  }

  if (pageNum > 1) {
    pdf.text(PAGE_W - MARGIN, 20, String(pageNum), 9, false, 'right')
  }

  const blob = pdf.build()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const fileDate = now.toISOString().split('T')[0]
  a.download = `YGPagamentos_Relatorio_Gerencial_${fileDate}.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
