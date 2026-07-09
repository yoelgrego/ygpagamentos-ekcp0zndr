import { useState, useMemo, useEffect } from 'react'
import { YgLabel, YgInput, YgButton, YgFieldGroup } from '@/components/yg-ui'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAppStore } from '@/stores/use-app-store'
import { api } from '@/services/api'
import { toast } from 'sonner'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import useRealtime from '@/hooks/use-realtime'
import { cn } from '@/lib/utils'
import { ObjetoEntrySection } from '@/components/ObjetoEntrySection'
import { useResizableColumns } from '@/hooks/use-resizable-columns'

const w = (chars: number) => `${chars * 8 + 12}px`

type LookupType =
  | 'fornecedor'
  | 'beneficiario'
  | 'moeda'
  | 'tipodoc'
  | 'pagador'
  | 'categoria'
  | 'natureza'
  | null

const defaultForm = {
  id: '',
  idmov: '',
  ano: '',
  mes: '',
  dia: '',
  valor: '',
  cartao: '',
  situacao: '',

  idforn: '',
  idfornNum: '',
  fornName: '',
  idben: '',
  idbenNum: '',
  benName: '',
  idmoeda: '',
  idmoedaNum: '',
  moedaName: '',
  idtipodoc: '',
  idtipodocNum: '',
  tipoDocName: '',
  idpag: '',
  idpagNum: '',
  pagadorName: '',
  idcat: '',
  idcatNum: '',
  catName: '',
  idnat: '',
  idnatNum: '',
  natName: '',
}

const GRID_COL_DEFS = [
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

const INITIAL_COL_WIDTHS = [
  50, 45, 40, 40, 60, 120, 55, 100, 55, 60, 80, 55, 50, 70, 50, 80, 70, 50, 90, 50, 90,
]

export default function Index() {
  const {
    movimentos,
    fornecedores,
    beneficiarios,
    moedas,
    tipodocs,
    pagadores,
    categorias,
    naturezas,
    fetchLookups,
    fetchMovimentos,
  } = useAppStore()

  useEffect(() => {
    fetchLookups()
    fetchMovimentos()
  }, [])

  useRealtime('01movimento', () => {
    fetchMovimentos()
  })
  useRealtime('02moveobjeto', () => {
    fetchMovimentos()
  })

  const [formData, setFormData] = useState(defaultForm)

  const [lookup, setLookup] = useState<{ isOpen: boolean; type: LookupType }>({
    isOpen: false,
    type: null,
  })

  const { colWidths, onResizeStart } = useResizableColumns({
    initialWidths: INITIAL_COL_WIDTHS,
    minWidth: 40,
    maxWidth: 600,
  })

  const handleLookup = (type: LookupType) => {
    setLookup({ isOpen: true, type })
  }

  const handleSelect = (record: any) => {
    switch (lookup.type) {
      case 'fornecedor':
        setFormData((p) => ({
          ...p,
          idforn: record.id,
          idfornNum: record.idforn?.toString() || '',
          fornName: record.nome,
        }))
        break
      case 'beneficiario':
        setFormData((p) => ({
          ...p,
          idben: record.id,
          idbenNum: record.idben?.toString() || '',
          benName: record.nome,
        }))
        break
      case 'moeda':
        setFormData((p) => ({
          ...p,
          idmoeda: record.id,
          idmoedaNum: record.idmoeda?.toString() || '',
          moedaName: record.descricao,
        }))
        break
      case 'tipodoc':
        setFormData((p) => ({
          ...p,
          idtipodoc: record.id,
          idtipodocNum: record.idtipodoc?.toString() || '',
          tipoDocName: record.descricao,
        }))
        break
      case 'pagador':
        setFormData((p) => ({
          ...p,
          idpag: record.id,
          idpagNum: record.idpag?.toString() || '',
          pagadorName: record.nome,
        }))
        break
      case 'categoria':
        setFormData((p) => ({
          ...p,
          idcat: record.id,
          idcatNum: record.idcat?.toString() || '',
          catName: record.descricao,
          idnat: '',
          idnatNum: '',
          natName: '',
        }))
        break
      case 'natureza':
        setFormData((p) => ({
          ...p,
          idnat: record.id,
          idnatNum: record.idnat?.toString() || '',
          natName: record.descricao,
        }))
        break
    }
    setLookup({ isOpen: false, type: null })
  }

  const lookupData = useMemo(() => {
    switch (lookup.type) {
      case 'fornecedor':
        return { headers: ['ID', 'Nome', 'CNPJ/CPF'], data: fornecedores }
      case 'beneficiario':
        return { headers: ['ID', 'Nome', 'Documento'], data: beneficiarios }
      case 'moeda':
        return { headers: ['ID', 'Símbolo', 'Descrição'], data: moedas }
      case 'tipodoc':
        return { headers: ['ID', 'Descrição'], data: tipodocs }
      case 'pagador':
        return { headers: ['ID', 'Nome'], data: pagadores }
      case 'categoria':
        return { headers: ['ID', 'Descrição'], data: categorias }
      case 'natureza':
        return {
          headers: ['ID', 'Descrição'],
          data: formData.idcat ? naturezas.filter((n) => n.idcat === formData.idcat) : naturezas,
        }
      default:
        return { headers: [], data: [] }
    }
  }, [
    lookup.type,
    formData.idcat,
    fornecedores,
    beneficiarios,
    moedas,
    tipodocs,
    pagadores,
    categorias,
    naturezas,
  ])

  const renderModalRow = (row: any) => {
    switch (lookup.type) {
      case 'fornecedor':
        return (
          <>
            <td className="p-1 border">{row.idforn}</td>
            <td className="p-1 border">{row.nome}</td>
            <td className="p-1 border">{row.cnpj_cpf}</td>
          </>
        )
      case 'beneficiario':
        return (
          <>
            <td className="p-1 border">{row.idben}</td>
            <td className="p-1 border">{row.nome}</td>
            <td className="p-1 border">{row.documento}</td>
          </>
        )
      case 'moeda':
        return (
          <>
            <td className="p-1 border">{row.idmoeda}</td>
            <td className="p-1 border">{row.simbolo}</td>
            <td className="p-1 border">{row.descricao}</td>
          </>
        )
      case 'tipodoc':
        return (
          <>
            <td className="p-1 border">{row.idtipodoc}</td>
            <td className="p-1 border">{row.descricao}</td>
          </>
        )
      case 'pagador':
        return (
          <>
            <td className="p-1 border">{row.idpag}</td>
            <td className="p-1 border">{row.nome}</td>
          </>
        )
      case 'categoria':
        return (
          <>
            <td className="p-1 border">{row.idcat}</td>
            <td className="p-1 border">{row.descricao}</td>
          </>
        )
      case 'natureza':
        return (
          <>
            <td className="p-1 border">{row.idnat}</td>
            <td className="p-1 border">{row.descricao}</td>
          </>
        )
      default:
        return null
    }
  }

  const v1Movimentos = useMemo(() => {
    return movimentos.map((row) => ({
      id: row.id,
      idmov: row.idmov,
      ano: row.ano,
      mes: row.mes,
      dia: row.dia,
      valor: row.valor,
      cartao: row.cartao,
      situacao: row.situacao,
      idforn: row.expand?.idforn?.idforn || '',
      fornecedorNome: row.expand?.idforn?.nome || '',
      idben: row.expand?.idben?.idben || '',
      beneficiarioNome: row.expand?.idben?.nome || '',
      idmoeda: row.expand?.idmoeda?.idmoeda || '',
      moedaSimbolo: row.expand?.idmoeda?.simbolo || '',
      idtipodoc: row.expand?.idtipodoc?.idtipodoc || '',
      tipoDocDesc: row.expand?.idtipodoc?.descricao || '',
      idpag: row.expand?.idpag?.idpag || '',
      pagadorNome: row.expand?.idpag?.nome || '',
      idnat: row.expand?.idnat?.idnat || '',
      naturezaDesc: row.expand?.idnat?.descricao || '',
      idcat: row.expand?.idnat?.expand?.idcat?.idcat || '',
      categoriaDesc: row.expand?.idnat?.expand?.idcat?.descricao || '',
      expand: row.expand,
    }))
  }, [movimentos])

  const handleRowClick = (row: any) => {
    setFormData({
      id: row.id,
      idmov: row.idmov?.toString() || '',
      ano: row.ano?.toString() || '',
      mes: row.mes?.toString() || '',
      dia: row.dia?.toString() || '',
      valor: row.valor?.toString() || '',
      cartao: row.cartao || '',
      situacao: row.situacao || 'Pendente',

      idforn: row.expand?.idforn?.id || '',
      idfornNum: row.expand?.idforn?.idforn?.toString() || '',
      fornName: row.fornecedorNome || '',

      idben: row.expand?.idben?.id || '',
      idbenNum: row.expand?.idben?.idben?.toString() || '',
      benName: row.beneficiarioNome || '',

      idmoeda: row.expand?.idmoeda?.id || '',
      idmoedaNum: row.expand?.idmoeda?.idmoeda?.toString() || '',
      moedaName: row.expand?.idmoeda?.descricao || '',

      idtipodoc: row.expand?.idtipodoc?.id || '',
      idtipodocNum: row.expand?.idtipodoc?.idtipodoc?.toString() || '',
      tipoDocName: row.tipoDocDesc || '',

      idpag: row.expand?.idpag?.id || '',
      idpagNum: row.expand?.idpag?.idpag?.toString() || '',
      pagadorName: row.pagadorNome || '',

      idnat: row.expand?.idnat?.id || '',
      idnatNum: row.expand?.idnat?.idnat?.toString() || '',
      natName: row.naturezaDesc || '',

      idcat: row.expand?.idnat?.expand?.idcat?.id || '',
      idcatNum: row.expand?.idnat?.expand?.idcat?.idcat?.toString() || '',
      catName: row.categoriaDesc || '',
    })
  }

  const handleNovo = () => {
    setFormData(defaultForm)
  }

  const handleLimpar = () => handleNovo()

  const handleExcluir = async () => {
    if (!formData.id) return toast.error('Nenhum movimento selecionado')
    try {
      await api.movimentos.delete(formData.id)
      toast.success('Excluído com sucesso')
      handleNovo()
    } catch (e) {
      toast.error('Erro ao excluir')
    }
  }

  const handleGravar = async () => {
    const ano = parseInt(formData.ano)
    const mes = parseInt(formData.mes)
    const dia = parseInt(formData.dia)
    if (isNaN(ano) || ano < 2000 || ano > 2100) return toast.error('Ano inválido (2000-2100)')
    if (isNaN(mes) || mes < 1 || mes > 12) return toast.error('Mês inválido (1-12)')
    if (isNaN(dia) || dia < 1 || dia > 31) return toast.error('Dia inválido (1-31)')
    if (!formData.valor) return toast.error('Valor é obrigatório')

    const payload = {
      ano,
      mes,
      dia,
      valor: parseFloat(formData.valor),
      idnat: formData.idnat || null,
      idforn: formData.idforn || null,
      idben: formData.idben || null,
      idpag: formData.idpag || null,
      idtipodoc: formData.idtipodoc || null,
      idmoeda: formData.idmoeda || null,
      cartao: formData.cartao,
      situacao: formData.situacao,
      idmov: formData.idmov
        ? parseInt(formData.idmov.toString())
        : Math.floor(Math.random() * 1000000),
    }

    try {
      if (formData.id) {
        await api.movimentos.update(formData.id, payload)
        toast.success('Atualizado com sucesso')
      } else {
        const res = await api.movimentos.create(payload)
        setFormData((p) => ({ ...p, id: res.id, idmov: res.idmov.toString() }))
        toast.success('Criado com sucesso')
      }
      fetchMovimentos()
    } catch (e) {
      const fieldErrs = extractFieldErrors(e)
      toast.error(Object.values(fieldErrs).join(', ') || 'Erro ao gravar')
    }
  }

  return (
    <div className="flex flex-col h-full gap-2 relative">
      <div className="flex gap-2 shrink-0">
        <div className="flex flex-col gap-2 flex-1 pt-1">
          <div className="flex gap-2">
            <YgFieldGroup>
              <YgLabel>ID</YgLabel>
              <YgInput
                style={{ width: w(7) }}
                value={formData.idmov}
                onChange={(e) => setFormData({ ...formData, idmov: e.target.value })}
              />
            </YgFieldGroup>
            <YgFieldGroup>
              <YgLabel>Ano</YgLabel>
              <YgInput
                style={{ width: w(4) }}
                value={formData.ano}
                onChange={(e) => setFormData({ ...formData, ano: e.target.value })}
              />
            </YgFieldGroup>
            <YgFieldGroup>
              <YgLabel>Mes</YgLabel>
              <YgInput
                style={{ width: w(2) }}
                value={formData.mes}
                onChange={(e) => setFormData({ ...formData, mes: e.target.value })}
              />
            </YgFieldGroup>
            <YgFieldGroup>
              <YgLabel>Dia</YgLabel>
              <YgInput
                style={{ width: w(2) }}
                value={formData.dia}
                onChange={(e) => setFormData({ ...formData, dia: e.target.value })}
              />
            </YgFieldGroup>
          </div>

          <div className="flex gap-2">
            <YgFieldGroup>
              <YgLabel>Fornecedor</YgLabel>
              <div className="flex">
                <YgInput style={{ width: w(6) }} value={formData.idfornNum} readOnly />
                <YgButton onClick={() => handleLookup('fornecedor')}>?</YgButton>
                <YgInput
                  style={{ width: w(30) }}
                  value={formData.fornName}
                  readOnly
                  className="bg-gray-50 ml-1"
                />
              </div>
            </YgFieldGroup>
          </div>

          <div className="flex gap-2">
            <YgFieldGroup>
              <YgLabel>Beneficiário</YgLabel>
              <div className="flex">
                <YgInput style={{ width: w(4) }} value={formData.idbenNum} readOnly />
                <YgButton onClick={() => handleLookup('beneficiario')}>?</YgButton>
                <YgInput
                  style={{ width: w(10) }}
                  value={formData.benName}
                  readOnly
                  className="bg-gray-50 ml-1"
                />
              </div>
            </YgFieldGroup>
          </div>

          <div className="flex gap-2">
            <YgFieldGroup>
              <YgLabel>Moeda</YgLabel>
              <div className="flex">
                <YgInput style={{ width: w(3) }} value={formData.idmoedaNum} readOnly />
                <YgButton onClick={() => handleLookup('moeda')}>?</YgButton>
                <YgInput
                  style={{ width: w(10) }}
                  value={formData.moedaName}
                  readOnly
                  className="bg-gray-50 ml-1"
                />
              </div>
            </YgFieldGroup>
            <YgFieldGroup>
              <YgLabel>Valor</YgLabel>
              <YgInput
                style={{ width: w(32) }}
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
              />
            </YgFieldGroup>
            <YgFieldGroup>
              <YgLabel>Cartão</YgLabel>
              <YgInput
                style={{ width: w(4) }}
                value={formData.cartao}
                onChange={(e) => setFormData({ ...formData, cartao: e.target.value })}
              />
            </YgFieldGroup>
          </div>

          <div className="flex gap-2">
            <YgFieldGroup>
              <YgLabel>Tipo de Documento</YgLabel>
              <div className="flex">
                <YgInput style={{ width: w(3) }} value={formData.idtipodocNum} readOnly />
                <YgButton onClick={() => handleLookup('tipodoc')}>?</YgButton>
                <YgInput
                  style={{ width: w(15) }}
                  value={formData.tipoDocName}
                  readOnly
                  className="bg-gray-50 ml-1"
                />
              </div>
            </YgFieldGroup>
            <YgFieldGroup>
              <YgLabel>Pagador</YgLabel>
              <div className="flex">
                <YgInput style={{ width: w(3) }} value={formData.idpagNum} readOnly />
                <YgButton onClick={() => handleLookup('pagador')}>?</YgButton>
                <YgInput
                  style={{ width: w(15) }}
                  value={formData.pagadorName}
                  readOnly
                  className="bg-gray-50 ml-1"
                />
              </div>
            </YgFieldGroup>
            <YgFieldGroup>
              <YgLabel>Situação</YgLabel>
              <YgInput
                style={{ width: w(10) }}
                value={formData.situacao}
                onChange={(e) => setFormData({ ...formData, situacao: e.target.value })}
              />
            </YgFieldGroup>
          </div>

          <div className="flex gap-2 items-end">
            <YgFieldGroup>
              <YgLabel>Categoria</YgLabel>
              <div className="flex">
                <YgInput style={{ width: w(4) }} value={formData.idcatNum} readOnly />
                <YgButton onClick={() => handleLookup('categoria')}>?</YgButton>
                <YgInput
                  style={{ width: w(15) }}
                  value={formData.catName}
                  readOnly
                  className="bg-gray-50 ml-1"
                />
              </div>
            </YgFieldGroup>
            <YgFieldGroup>
              <YgLabel>Natureza</YgLabel>
              <div className="flex">
                <YgInput style={{ width: w(4) }} value={formData.idnatNum} readOnly />
                <YgButton onClick={() => handleLookup('natureza')}>?</YgButton>
                <YgInput
                  style={{ width: w(15) }}
                  value={formData.natName}
                  readOnly
                  className="bg-gray-50 ml-1"
                />
              </div>
            </YgFieldGroup>
          </div>
        </div>
      </div>

      <div
        className="flex-1 min-h-0 overflow-auto yg-scrollbar border border-gray-400 bg-white shadow-inner mt-2"
        style={{ touchAction: 'pan-y' }}
      >
        <table
          className="text-[11px] text-left border-collapse"
          style={{ tableLayout: 'fixed', width: colWidths.reduce((a, b) => a + b, 0) }}
        >
          <colgroup>
            {colWidths.map((cw, i) => (
              <col key={i} style={{ width: cw }} />
            ))}
          </colgroup>
          <thead className="bg-yg-dark text-white sticky top-0 z-20">
            <tr>
              {GRID_COL_DEFS.map((col, i) => (
                <th
                  key={col}
                  className={cn(
                    'font-bold p-1 px-2 border-r border-white/20 relative',
                    i === 0 && 'sticky left-0 z-30 bg-yg-dark',
                  )}
                >
                  <span className="block overflow-hidden text-ellipsis whitespace-nowrap">
                    {col}
                  </span>
                  {i < GRID_COL_DEFS.length - 1 && (
                    <div
                      className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-white/40 active:bg-white/70 transition-colors duration-150 touch-none"
                      onMouseDown={onResizeStart(i)}
                      onTouchStart={onResizeStart(i)}
                    />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {v1Movimentos.map((row) => {
              const cells = [
                row.idmov,
                row.ano,
                (row.mes || '').toString().padStart(2, '0'),
                (row.dia || '').toString().padStart(2, '0'),
                row.idforn,
                row.fornecedorNome,
                row.idben,
                row.beneficiarioNome,
                row.idmoeda,
                row.moedaSimbolo,
                Number(row.valor || 0).toFixed(2),
                row.cartao,
                row.idtipodoc,
                row.tipoDocDesc,
                row.idpag,
                row.pagadorNome,
                row.situacao,
                row.idcat,
                row.categoriaDesc,
                row.idnat,
                row.naturezaDesc,
              ]
              return (
                <tr
                  key={row.id}
                  onClick={() => handleRowClick(row)}
                  className="group border-b border-gray-200 hover:bg-sky-100 cursor-pointer"
                >
                  {cells.map((cell, i) => (
                    <td
                      key={i}
                      className={cn(
                        'p-1 px-2 border-r overflow-hidden text-ellipsis whitespace-nowrap',
                        i === 0 && 'sticky left-0 z-10 bg-white group-hover:bg-sky-100',
                        i === 10 && 'text-right',
                      )}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              )
            })}
            {[...Array(10)].map((_, i) => (
              <tr key={`empty-${i}`} className="border-b border-gray-200 h-[24px]">
                {[...Array(21)].map((_, j) => (
                  <td
                    key={j}
                    className={cn('border-r', j === 0 && 'sticky left-0 z-10 bg-white')}
                  ></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2">
        <h3 className="text-sm font-semibold text-yg-dark mb-1">Entrada de Objetos</h3>
        <ObjetoEntrySection />
      </div>

      <footer className="h-10 bg-yg-dark shrink-0 flex items-center px-1 gap-1 -mx-2 -mb-2 mt-2">
        {[
          { label: 'Novo', action: handleNovo },
          { label: 'Gravar', action: handleGravar },
          { label: 'Excluir', action: handleExcluir },
          { label: 'Limpar', action: handleLimpar },
          {
            label: 'Relatório',
            action: () => toast.info('Relatório não implementado nesta versão.'),
          },
          { label: 'Análise', action: () => toast.info('Análise não implementada nesta versão.') },
        ].map((btn) => (
          <button
            key={btn.label}
            onClick={btn.action}
            className="flex-1 h-full flex items-center justify-center text-yg-gold font-bold text-[12px] border-r border-white/20 last:border-r-0 hover:bg-white/10 transition-colors"
          >
            {btn.label}
          </button>
        ))}
      </footer>

      <Dialog
        open={lookup.isOpen}
        onOpenChange={(open) => !open && setLookup({ isOpen: false, type: null })}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0 gap-0 bg-yg-bg border-yg-dark rounded-none">
          <DialogHeader className="bg-yg-dark text-white p-2">
            <DialogTitle className="text-sm font-bold capitalize">
              Selecionar {lookup.type}
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 overflow-auto yg-scrollbar bg-white">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  {lookupData.headers.map((h, i) => (
                    <th key={i} className="p-1 border border-gray-300 font-bold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lookupData.data.map((row: any, i) => (
                  <tr
                    key={i}
                    className="hover:bg-blue-100 cursor-pointer"
                    onClick={() => handleSelect(row)}
                  >
                    {renderModalRow(row)}
                  </tr>
                ))}
                {lookupData.data.length === 0 && (
                  <tr>
                    <td
                      colSpan={lookupData.headers.length}
                      className="p-4 text-center text-gray-500"
                    >
                      Nenhum registro encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
