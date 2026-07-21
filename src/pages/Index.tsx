import { useState, useMemo, useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { Link } from 'react-router-dom'
import { Upload, Loader2, AlertTriangle, Search } from 'lucide-react'
import { YgLabel, YgInput, YgButton, YgFieldGroup } from '@/components/yg-ui'
import { useAppStore } from '@/stores/use-app-store'
import { api } from '@/services/api'
import pb from '@/lib/pocketbase/client'
import { toast } from 'sonner'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import { useRealtime } from '@/hooks/use-realtime'
import { cn } from '@/lib/utils'
import { ObjetoEntrySection, type PendingObj } from '@/components/ObjetoEntrySection'
import { ValidationDialog } from '@/components/ValidationDialog'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { EntitySearchModal } from '@/components/EntitySearchModal'
import { AnalysisModal } from '@/components/AnalysisModal'
import { ENTITY_CONFIGS, FORM_FIELD_MAP } from '@/lib/entity-config'
import { useResizableColumns } from '@/hooks/use-resizable-columns'
import { isValidAno, isValidMes, isValidDia, numericOnly } from '@/lib/date-validation'
import { normalizeDecimalInput } from '@/lib/decimal-utils'

const w = (chars: number) => `${chars * 8 + 12}px`

const defaultForm = {
  id: '',
  idmov: '',
  ano: '',
  mes: '',
  dia: '',
  valor: '',
  cartao: '',
  situacao: '',
  idfornNum: '',
  fornName: '',
  idbenNum: '',
  benName: '',
  idmoedaNum: '',
  moedaName: '',
  idtipodocNum: '',
  tipoDocName: '',
  idpagNum: '',
  pagadorName: '',
  idcatNum: '',
  catName: '',
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

function createLookupMap(items: any[], idField: string, nameField: string): Map<number, string> {
  const map = new Map<number, string>()
  for (const item of items) {
    const id = Number(item[idField])
    if (!isNaN(id)) map.set(id, item[nameField] || '')
  }
  return map
}

interface ConsultaFilter {
  idm?: number
  ano?: number
  mes?: number
  dia?: number
  idforn?: number
  idben?: number
  idmoeda?: number
  valor?: number
  cartao?: number
  idtipodoc?: number
  idpag?: number
  situacao?: string
  idcat?: number
  idnat?: number
  matchingIdmovs?: Set<number>
}

async function fetchMaxIdm(): Promise<number> {
  try {
    const result = await pb.collection('01movimento').getList(1, 1, { sort: '-idm' })
    return result.items.length > 0 ? (result.items[0] as any).idm : 0
  } catch {
    return 0
  }
}

export default function Index() {
  const {
    movimentos,
    fornecedores,
    beneficiarios,
    moedas,
    objetos,
    tipodocs,
    pagadores,
    categorias,
    naturezas,
    loading,
    error,
    fetchLookups,
    fetchMovimentos,
  } = useAppStore()

  useEffect(() => {
    fetchLookups()
    fetchMovimentos()
  }, [fetchLookups, fetchMovimentos])

  useRealtime('01movimento', () => {
    fetchMovimentos()
  })
  useRealtime('02moveobjeto', () => {
    fetchMovimentos()
  })

  const [formData, setFormData] = useState(defaultForm)
  const [objetoItems, setObjetoItems] = useState<PendingObj[]>([])
  const [entityModal, setEntityModal] = useState<{ open: boolean; type: string | null }>({
    open: false,
    type: null,
  })
  const [consultaFilter, setConsultaFilter] = useState<ConsultaFilter | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    message: string
    onConfirm: () => void
  }>({ open: false, message: '', onConfirm: () => {} })
  const [analysisOpen, setAnalysisOpen] = useState(false)

  const idRef = useRef<HTMLInputElement>(null)
  const anoRef = useRef<HTMLInputElement>(null)
  const mesRef = useRef<HTMLInputElement>(null)
  const diaRef = useRef<HTMLInputElement>(null)
  const fornIdRef = useRef<HTMLInputElement>(null)
  const benIdRef = useRef<HTMLInputElement>(null)
  const moedaIdRef = useRef<HTMLInputElement>(null)
  const valorRef = useRef<HTMLInputElement>(null)
  const cartaoRef = useRef<HTMLInputElement>(null)
  const tipodocIdRef = useRef<HTMLInputElement>(null)
  const pagIdRef = useRef<HTMLInputElement>(null)
  const situacaoRef = useRef<HTMLInputElement>(null)
  const catIdRef = useRef<HTMLInputElement>(null)
  const natIdRef = useRef<HTMLInputElement>(null)

  const [validationOpen, setValidationOpen] = useState(false)
  const [validationMessage, setValidationMessage] = useState('')
  const [validationTitle, setValidationTitle] = useState('Aviso')
  const focusAfterClose = useRef<RefObject<HTMLInputElement> | null>(null)

  useEffect(() => {
    idRef.current?.focus()
  }, [])

  const { colWidths, onResizeStart } = useResizableColumns({
    initialWidths: INITIAL_COL_WIDTHS,
    minWidth: 40,
    maxWidth: 600,
  })

  const lookupMaps = useMemo(
    () => ({
      fornecedor: createLookupMap(fornecedores, 'idfornece', 'nofornece'),
      beneficiario: createLookupMap(beneficiarios, 'idbenef', 'nobenef'),
      moeda: createLookupMap(moedas, 'idmoeda', 'nomoeda'),
      tipodoc: createLookupMap(tipodocs, 'idtipo', 'notipo'),
      pagador: createLookupMap(pagadores, 'idpaga', 'nopaga'),
      categoria: createLookupMap(categorias, 'idcat', 'nocat'),
      natureza: createLookupMap(naturezas, 'idnat', 'nonat'),
    }),
    [fornecedores, beneficiarios, moedas, tipodocs, pagadores, categorias, naturezas],
  )

  const v1Movimentos = useMemo(() => {
    return movimentos.map((row: any) => ({
      id: row.id,
      idmov: row.idm,
      ano: row.ano,
      mes: row.mes,
      dia: row.dia,
      valor: row.valor,
      cartao: row.card,
      situacao: row.pago,
      idforn: row.idfornece,
      fornecedorNome: lookupMaps.fornecedor.get(row.idfornece) || '',
      idben: row.idbenef,
      beneficiarioNome: lookupMaps.beneficiario.get(row.idbenef) || '',
      idmoeda: row.idmoeda,
      moedaNome: lookupMaps.moeda.get(row.idmoeda) || '',
      idtipodoc: row.idtipo,
      tipoDocNome: lookupMaps.tipodoc.get(row.idtipo) || '',
      idpag: row.idpaga,
      pagadorNome: lookupMaps.pagador.get(row.idpaga) || '',
      idcat: row.idcat,
      categoriaNome: lookupMaps.categoria.get(row.idcat) || '',
      idnat: row.idnat,
      naturezaNome: lookupMaps.natureza.get(row.idnat) || '',
    }))
  }, [movimentos, lookupMaps])

  const displayMovimentos = useMemo(() => {
    if (!consultaFilter) return v1Movimentos
    const filtered = v1Movimentos.filter((row: any) => {
      const f = consultaFilter
      if (f.idm !== undefined && row.idmov !== f.idm) return false
      if (f.ano !== undefined && row.ano !== f.ano) return false
      if (f.mes !== undefined && row.mes !== f.mes) return false
      if (f.dia !== undefined && row.dia !== f.dia) return false
      if (f.idforn !== undefined && row.idforn !== f.idforn) return false
      if (f.idben !== undefined && row.idben !== f.idben) return false
      if (f.idmoeda !== undefined && row.idmoeda !== f.idmoeda) return false
      if (f.valor !== undefined && Math.abs(Number(row.valor) - f.valor) > 0.01) return false
      if (f.cartao !== undefined && row.cartao !== f.cartao) return false
      if (f.idtipodoc !== undefined && row.idtipodoc !== f.idtipodoc) return false
      if (f.idpag !== undefined && row.idpag !== f.idpag) return false
      if (f.situacao !== undefined && row.situacao !== f.situacao) return false
      if (f.idcat !== undefined && row.idcat !== f.idcat) return false
      if (f.idnat !== undefined && row.idnat !== f.idnat) return false
      if (f.matchingIdmovs !== undefined && !f.matchingIdmovs.has(row.idmov)) return false
      return true
    })
    return [...filtered].sort((a: any, b: any) => {
      if (b.ano !== a.ano) return b.ano - a.ano
      if (b.mes !== a.mes) return b.mes - a.mes
      if (b.dia !== a.dia) return b.dia - a.dia
      return (a.fornecedorNome || '').localeCompare(b.fornecedorNome || '')
    })
  }, [v1Movimentos, consultaFilter])

  const showValidation = (message: string, ref?: RefObject<HTMLInputElement>, title?: string) => {
    focusAfterClose.current = ref || null
    setValidationTitle(title || 'Aviso')
    setValidationMessage(message)
    setValidationOpen(true)
  }

  const handleValidationClose = () => {
    setValidationOpen(false)
    const ref = focusAfterClose.current
    if (ref) setTimeout(() => ref.current?.focus(), 50)
  }

  const handleNumericChange = (field: string, value: string) => {
    setFormData((p) => ({ ...p, [field]: numericOnly(value) }))
  }

  const loadObjetosForMov = async (idmov: number) => {
    try {
      const moveobjetos = await api.moveobjetos.listByMov(idmov)
      const objItems: PendingObj[] = moveobjetos.map((mo: any) => {
        const obj = objetos.find((o: any) => o.idobj === mo.idobj)
        return { idobj: obj?.id || '', idobjNum: mo.idobj, nobj: obj?.nobj || '' }
      })
      setObjetoItems(objItems)
    } catch {
      setObjetoItems([])
    }
  }

  const handleRowClick = async (row: any) => {
    setFormData({
      id: row.id,
      idmov: row.idmov?.toString() || '',
      ano: row.ano?.toString() || '',
      mes: row.mes?.toString() || '',
      dia: row.dia?.toString() || '',
      valor: row.valor?.toString() || '',
      cartao: row.cartao?.toString() || '',
      situacao: row.situacao || '',
      idfornNum: row.idforn?.toString() || '',
      fornName: row.fornecedorNome || '',
      idbenNum: row.idben?.toString() || '',
      benName: row.beneficiarioNome || '',
      idmoedaNum: row.idmoeda?.toString() || '',
      moedaName: row.moedaNome || '',
      idtipodocNum: row.idtipodoc?.toString() || '',
      tipoDocName: row.tipoDocNome || '',
      idpagNum: row.idpag?.toString() || '',
      pagadorName: row.pagadorNome || '',
      idcatNum: row.idcat?.toString() || '',
      catName: row.categoriaNome || '',
      idnatNum: row.idnat?.toString() || '',
      natName: row.naturezaNome || '',
    })
    await loadObjetosForMov(row.idmov)
  }

  const handleIdBlur = async () => {
    const idValue = formData.idmov.trim()
    if (!idValue) return
    const idNum = parseInt(idValue)
    if (isNaN(idNum)) return
    const found = v1Movimentos.find((m: any) => m.idmov === idNum)
    if (found) {
      await handleRowClick(found)
    } else {
      const maxIdm = movimentos.reduce((max: number, m: any) => Math.max(max, m.idm || 0), 0)
      setFormData((p) => ({ ...p, idmov: (maxIdm + 1).toString() }))
      setObjetoItems([])
    }
  }

  const handleAnoBlur = () => {
    if (!formData.ano.trim()) return
    if (!isValidAno(formData.ano)) {
      setFormData((p) => ({ ...p, ano: '' }))
      showValidation(
        'Dado inválido. Ano deve ser maior ou igual a 1900, usando os quatro dígitos',
        anoRef,
      )
    }
  }

  const handleMesBlur = () => {
    if (!formData.mes.trim()) return
    if (!isValidMes(formData.mes)) {
      setFormData((p) => ({ ...p, mes: '' }))
      showValidation('Mês inválido. Digite novamente', mesRef)
    }
  }

  const handleDiaBlur = () => {
    if (!formData.dia.trim()) return
    if (!isValidDia(formData.dia, formData.ano, formData.mes)) {
      setFormData((p) => ({ ...p, dia: '' }))
      showValidation('Dia inválido. Digite novamente', diaRef)
    }
  }

  const handleEntityIdBlur = async (
    type: string,
    idValue: string,
    ref: RefObject<HTMLInputElement>,
  ) => {
    const val = idValue.trim()
    if (!val) return
    const num = parseInt(val)
    if (isNaN(num)) {
      const fm = FORM_FIELD_MAP[type]
      setFormData((p) => ({ ...p, [fm.idField]: '', [fm.nameField]: '' }))
      return
    }
    const config = ENTITY_CONFIGS[type]
    try {
      const found = await pb
        .collection(config.collection)
        .getFirstListItem(`${config.idField} = ${num}`)
      const fm = FORM_FIELD_MAP[type]
      setFormData((p) => ({ ...p, [fm.nameField]: found[config.nameField] }))
    } catch {
      const fm = FORM_FIELD_MAP[type]
      setFormData((p) => ({ ...p, [fm.idField]: '', [fm.nameField]: '' }))
      showValidation('Código inválido. Consulte a base de dados usando o botão.', ref)
    }
  }

  const openEntityModal = (type: string) => setEntityModal({ open: true, type })

  const handleEntitySelect = (record: { codigo: string; valor: string }) => {
    if (!entityModal.type) return
    const fm = FORM_FIELD_MAP[entityModal.type]
    if (fm) {
      setFormData((p) => ({ ...p, [fm.idField]: record.codigo, [fm.nameField]: record.valor }))
    }
    setEntityModal({ open: false, type: null })
  }

  const diaDisabled = !isValidAno(formData.ano) || !isValidMes(formData.mes)

  const handleNovo = async () => {
    setFormData(defaultForm)
    setObjetoItems([])
    setConsultaFilter(null)
    const maxIdm = await fetchMaxIdm()
    const fallbackMax = movimentos.reduce((max: number, m: any) => Math.max(max, m.idm || 0), 0)
    const nextId = Math.max(maxIdm, fallbackMax) + 1
    setFormData((p) => ({ ...p, idmov: nextId.toString() }))
    setTimeout(() => idRef.current?.focus(), 50)
  }

  const handleLimpar = () => {
    setFormData(defaultForm)
    setObjetoItems([])
    setConsultaFilter(null)
    setTimeout(() => idRef.current?.focus(), 50)
  }

  const handleExcluir = async () => {
    if (!formData.id) return toast.error('Nenhum movimento selecionado')
    try {
      await api.movimentos.delete(formData.id)
      toast.success('Excluído com sucesso')
      handleNovo()
    } catch {
      toast.error('Erro ao excluir')
    }
  }

  const proceedWithGravar = async (idm: number, recordId?: string) => {
    const payload = {
      idm,
      ano: parseInt(formData.ano),
      mes: parseInt(formData.mes),
      dia: parseInt(formData.dia),
      idfornece: parseInt(formData.idfornNum),
      idbenef: parseInt(formData.idbenNum),
      idmoeda: parseInt(formData.idmoedaNum),
      valor: parseFloat(formData.valor.replace(',', '.')),
      idtipo: parseInt(formData.idtipodocNum),
      card: parseInt(formData.cartao) === 2 ? 2 : 1,
      idpaga: parseInt(formData.idpagNum),
      pago: formData.situacao,
      idcat: parseInt(formData.idcatNum),
      idnat: parseInt(formData.idnatNum),
    }
    try {
      let savedId: string
      if (recordId) {
        await api.movimentos.update(recordId, payload)
        savedId = recordId
      } else {
        const res = await api.movimentos.create(payload)
        savedId = res.id
      }
      await api.moveobjetos.deleteByMov(idm)
      for (const item of objetoItems) {
        await api.moveobjetos.create({ idmov: idm, idobj: item.idobjNum })
      }
      setFormData((p) => ({ ...p, id: savedId, idmov: idm.toString() }))
      setConsultaFilter({ idm })
      await fetchMovimentos()
      showValidation('Registro gravado', undefined, 'Informação')
    } catch (e) {
      const fieldErrs = extractFieldErrors(e)
      toast.error(Object.values(fieldErrs).join(', ') || 'Erro ao gravar')
    }
  }

  const handleGravar = async () => {
    const mandatoryFields: { value: string; ref: RefObject<HTMLInputElement> }[] = [
      { value: formData.ano, ref: anoRef },
      { value: formData.mes, ref: mesRef },
      { value: formData.dia, ref: diaRef },
      { value: formData.idfornNum && formData.fornName ? formData.idfornNum : '', ref: fornIdRef },
      { value: formData.idbenNum && formData.benName ? formData.idbenNum : '', ref: benIdRef },
      {
        value: formData.idmoedaNum && formData.moedaName ? formData.idmoedaNum : '',
        ref: moedaIdRef,
      },
      { value: formData.valor, ref: valorRef },
      { value: formData.cartao, ref: cartaoRef },
      {
        value: formData.idtipodocNum && formData.tipoDocName ? formData.idtipodocNum : '',
        ref: tipodocIdRef,
      },
      { value: formData.idpagNum && formData.pagadorName ? formData.idpagNum : '', ref: pagIdRef },
      { value: formData.situacao, ref: situacaoRef },
      { value: formData.idcatNum && formData.catName ? formData.idcatNum : '', ref: catIdRef },
      { value: formData.idnatNum && formData.natName ? formData.idnatNum : '', ref: natIdRef },
    ]
    const emptyField = mandatoryFields.find((f) => !f.value.trim())
    if (emptyField) {
      showValidation('Faltam dados necessários', emptyField.ref)
      return
    }
    let idmValue = formData.idmov.trim()
    if (!idmValue) {
      const maxIdm = await fetchMaxIdm()
      const fallbackMax = movimentos.reduce((max: number, m: any) => Math.max(max, m.idm || 0), 0)
      idmValue = (Math.max(maxIdm, fallbackMax) + 1).toString()
      setFormData((p) => ({ ...p, idmov: idmValue }))
    }
    const idm = parseInt(idmValue)
    if (isNaN(idm)) return toast.error('ID inválido')
    const existingMov = movimentos.find((m: any) => m.idm === idm)
    if (existingMov && formData.id !== existingMov.id) {
      setConfirmDialog({
        open: true,
        message: 'Registro já existente. Deseja alterar o já gravado?',
        onConfirm: () => {
          setConfirmDialog((prev) => ({ ...prev, open: false }))
          proceedWithGravar(idm, existingMov.id)
        },
      })
      return
    }
    await proceedWithGravar(idm, existingMov?.id || formData.id || undefined)
  }

  const handleConsultar = async () => {
    const filter: ConsultaFilter = {}
    if (formData.idmov.trim()) filter.idm = parseInt(formData.idmov)
    if (formData.ano.trim()) filter.ano = parseInt(formData.ano)
    if (formData.mes.trim()) filter.mes = parseInt(formData.mes)
    if (formData.dia.trim()) filter.dia = parseInt(formData.dia)
    if (formData.idfornNum.trim()) filter.idforn = parseInt(formData.idfornNum)
    if (formData.idbenNum.trim()) filter.idben = parseInt(formData.idbenNum)
    if (formData.idmoedaNum.trim()) filter.idmoeda = parseInt(formData.idmoedaNum)
    if (formData.valor.trim()) filter.valor = parseFloat(formData.valor.replace(',', '.'))
    if (formData.cartao.trim()) filter.cartao = parseInt(formData.cartao)
    if (formData.idtipodocNum.trim()) filter.idtipodoc = parseInt(formData.idtipodocNum)
    if (formData.idpagNum.trim()) filter.idpag = parseInt(formData.idpagNum)
    if (formData.situacao.trim()) filter.situacao = formData.situacao
    if (formData.idcatNum.trim()) filter.idcat = parseInt(formData.idcatNum)
    if (formData.idnatNum.trim()) filter.idnat = parseInt(formData.idnatNum)
    if (objetoItems.length > 0) {
      try {
        const allMoveobjetos = await api.moveobjetos.listAll()
        const objIds = objetoItems.map((oi) => oi.idobjNum)
        filter.matchingIdmovs = new Set(
          allMoveobjetos.filter((mo: any) => objIds.includes(mo.idobj)).map((mo: any) => mo.idmov),
        )
      } catch {
        /* skip object filtering on error */
      }
    }
    if (Object.keys(filter).length === 0) {
      setConsultaFilter(null)
      toast.info('Exibindo todos os registros')
      return
    }
    setConsultaFilter(filter)
    toast.info('Consulta realizada')
  }

  const nameFieldClass = 'bg-gray-50 ml-1 pointer-events-none select-none'

  return (
    <div className="flex flex-col h-full gap-2 relative">
      <div className="flex items-center gap-2 shrink-0 self-start">
        <Link
          to="/import"
          className="flex items-center gap-2 bg-yg-dark text-white px-3 py-1.5 hover:bg-blue-800 transition-colors group"
        >
          <Upload className="w-4 h-4 text-yg-gold group-hover:text-white transition-colors" />
          <span className="text-[12px] font-bold">Acessar Importação</span>
        </Link>
      </div>

      <div className="flex gap-2 shrink-0">
        <div className="flex flex-col gap-2 flex-1 pt-1">
          <div className="flex gap-2">
            <YgFieldGroup>
              <YgLabel>ID</YgLabel>
              <YgInput
                ref={idRef}
                style={{ width: w(7) }}
                value={formData.idmov}
                onChange={(e: any) => handleNumericChange('idmov', e.target.value)}
                onBlur={handleIdBlur}
              />
            </YgFieldGroup>
            <YgFieldGroup>
              <YgLabel>Ano</YgLabel>
              <YgInput
                ref={anoRef}
                style={{ width: w(4) }}
                value={formData.ano}
                onChange={(e: any) => handleNumericChange('ano', e.target.value)}
                onBlur={handleAnoBlur}
              />
            </YgFieldGroup>
            <YgFieldGroup>
              <YgLabel>Mes</YgLabel>
              <YgInput
                ref={mesRef}
                style={{ width: w(2) }}
                value={formData.mes}
                onChange={(e: any) => handleNumericChange('mes', e.target.value)}
                onBlur={handleMesBlur}
              />
            </YgFieldGroup>
            <YgFieldGroup>
              <YgLabel>Dia</YgLabel>
              <YgInput
                ref={diaRef}
                style={{ width: w(2) }}
                value={formData.dia}
                disabled={diaDisabled}
                onChange={(e: any) => handleNumericChange('dia', e.target.value)}
                onBlur={handleDiaBlur}
                className={cn(diaDisabled && 'bg-gray-200 cursor-not-allowed')}
              />
            </YgFieldGroup>
          </div>

          <div className="flex gap-2">
            <YgFieldGroup>
              <YgLabel>Fornecedor</YgLabel>
              <div className="flex">
                <YgInput
                  ref={fornIdRef}
                  style={{ width: w(6) }}
                  value={formData.idfornNum}
                  onChange={(e: any) => handleNumericChange('idfornNum', e.target.value)}
                  onBlur={() => handleEntityIdBlur('fornecedor', formData.idfornNum, fornIdRef)}
                />
                <YgButton onClick={() => openEntityModal('fornecedor')}>?</YgButton>
                <YgInput
                  style={{ width: w(30) }}
                  value={formData.fornName}
                  readOnly
                  tabIndex={-1}
                  className={nameFieldClass}
                />
              </div>
            </YgFieldGroup>
          </div>

          <div className="flex gap-2">
            <YgFieldGroup>
              <YgLabel>Beneficiário</YgLabel>
              <div className="flex">
                <YgInput
                  ref={benIdRef}
                  style={{ width: w(4) }}
                  value={formData.idbenNum}
                  onChange={(e: any) => handleNumericChange('idbenNum', e.target.value)}
                  onBlur={() => handleEntityIdBlur('beneficiario', formData.idbenNum, benIdRef)}
                />
                <YgButton onClick={() => openEntityModal('beneficiario')}>?</YgButton>
                <YgInput
                  style={{ width: w(10) }}
                  value={formData.benName}
                  readOnly
                  tabIndex={-1}
                  className={nameFieldClass}
                />
              </div>
            </YgFieldGroup>
          </div>

          <div className="flex gap-2">
            <YgFieldGroup>
              <YgLabel>Moeda</YgLabel>
              <div className="flex">
                <YgInput
                  ref={moedaIdRef}
                  style={{ width: w(3) }}
                  value={formData.idmoedaNum}
                  onChange={(e: any) => handleNumericChange('idmoedaNum', e.target.value)}
                  onBlur={() => handleEntityIdBlur('moeda', formData.idmoedaNum, moedaIdRef)}
                />
                <YgButton onClick={() => openEntityModal('moeda')}>?</YgButton>
                <YgInput
                  style={{ width: w(10) }}
                  value={formData.moedaName}
                  readOnly
                  tabIndex={-1}
                  className={nameFieldClass}
                />
              </div>
            </YgFieldGroup>
            <YgFieldGroup>
              <YgLabel>Valor</YgLabel>
              <YgInput
                ref={valorRef}
                style={{ width: w(32) }}
                value={formData.valor}
                onChange={(e: any) =>
                  setFormData({ ...formData, valor: normalizeDecimalInput(e.target.value) })
                }
              />
            </YgFieldGroup>
            <YgFieldGroup>
              <YgLabel>Cartão</YgLabel>
              <YgInput
                ref={cartaoRef}
                style={{ width: w(4) }}
                value={formData.cartao}
                onChange={(e: any) => setFormData({ ...formData, cartao: e.target.value })}
              />
            </YgFieldGroup>
          </div>

          <div className="flex gap-2">
            <YgFieldGroup>
              <YgLabel>Tipo de Documento</YgLabel>
              <div className="flex">
                <YgInput
                  ref={tipodocIdRef}
                  style={{ width: w(3) }}
                  value={formData.idtipodocNum}
                  onChange={(e: any) => handleNumericChange('idtipodocNum', e.target.value)}
                  onBlur={() => handleEntityIdBlur('tipodoc', formData.idtipodocNum, tipodocIdRef)}
                />
                <YgButton onClick={() => openEntityModal('tipodoc')}>?</YgButton>
                <YgInput
                  style={{ width: w(15) }}
                  value={formData.tipoDocName}
                  readOnly
                  tabIndex={-1}
                  className={nameFieldClass}
                />
              </div>
            </YgFieldGroup>
            <YgFieldGroup>
              <YgLabel>Pagador</YgLabel>
              <div className="flex">
                <YgInput
                  ref={pagIdRef}
                  style={{ width: w(3) }}
                  value={formData.idpagNum}
                  onChange={(e: any) => handleNumericChange('idpagNum', e.target.value)}
                  onBlur={() => handleEntityIdBlur('pagador', formData.idpagNum, pagIdRef)}
                />
                <YgButton onClick={() => openEntityModal('pagador')}>?</YgButton>
                <YgInput
                  style={{ width: w(15) }}
                  value={formData.pagadorName}
                  readOnly
                  tabIndex={-1}
                  className={nameFieldClass}
                />
              </div>
            </YgFieldGroup>
            <YgFieldGroup>
              <YgLabel>Situação</YgLabel>
              <YgInput
                ref={situacaoRef}
                style={{ width: w(10) }}
                value={formData.situacao}
                onChange={(e: any) => setFormData({ ...formData, situacao: e.target.value })}
              />
            </YgFieldGroup>
          </div>

          <div className="flex gap-2 items-end">
            <YgFieldGroup>
              <YgLabel>Categoria</YgLabel>
              <div className="flex">
                <YgInput
                  ref={catIdRef}
                  style={{ width: w(4) }}
                  value={formData.idcatNum}
                  onChange={(e: any) => handleNumericChange('idcatNum', e.target.value)}
                  onBlur={() => handleEntityIdBlur('categoria', formData.idcatNum, catIdRef)}
                />
                <YgButton onClick={() => openEntityModal('categoria')}>?</YgButton>
                <YgInput
                  style={{ width: w(15) }}
                  value={formData.catName}
                  readOnly
                  tabIndex={-1}
                  className={nameFieldClass}
                />
              </div>
            </YgFieldGroup>
            <YgFieldGroup>
              <YgLabel>Natureza</YgLabel>
              <div className="flex">
                <YgInput
                  ref={natIdRef}
                  style={{ width: w(4) }}
                  value={formData.idnatNum}
                  onChange={(e: any) => handleNumericChange('idnatNum', e.target.value)}
                  onBlur={() => handleEntityIdBlur('natureza', formData.idnatNum, natIdRef)}
                />
                <YgButton onClick={() => openEntityModal('natureza')}>?</YgButton>
                <YgInput
                  style={{ width: w(15) }}
                  value={formData.natName}
                  readOnly
                  tabIndex={-1}
                  className={nameFieldClass}
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
        {loading ? (
          <div className="flex items-center justify-center h-full min-h-[200px]">
            <Loader2 className="w-6 h-6 text-yg-royal animate-spin" />
            <span className="ml-2 text-sm text-gray-600">Carregando movimentos...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[200px] gap-2">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <span className="text-sm text-red-600">{error}</span>
            <button
              onClick={() => fetchMovimentos()}
              className="text-xs text-yg-royal underline hover:opacity-70"
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <table
            className="text-[11px] text-left border-collapse"
            style={{
              tableLayout: 'fixed',
              width: colWidths.reduce((a: number, b: number) => a + b, 0),
            }}
          >
            <colgroup>
              {colWidths.map((cw: number, i: number) => (
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
              {displayMovimentos.length === 0 && (
                <tr>
                  <td colSpan={GRID_COL_DEFS.length} className="text-center text-gray-500 py-8">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              )}
              {displayMovimentos.map((row: any) => {
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
                  row.moedaNome,
                  Number(row.valor || 0).toFixed(2),
                  row.cartao,
                  row.idtipodoc,
                  row.tipoDocNome,
                  row.idpag,
                  row.pagadorNome,
                  row.situacao,
                  row.idcat,
                  row.categoriaNome,
                  row.idnat,
                  row.naturezaNome,
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
              {displayMovimentos.length > 0 &&
                [...Array(10)].map((_, i) => (
                  <tr key={`empty-${i}`} className="border-b border-gray-200 h-[24px]">
                    {[...Array(GRID_COL_DEFS.length)].map((_, j) => (
                      <td
                        key={j}
                        className={cn('border-r', j === 0 && 'sticky left-0 z-10 bg-white')}
                      ></td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-2">
        <h3 className="text-sm font-semibold text-yg-dark mb-1">Entrada de Objetos</h3>
        <ObjetoEntrySection items={objetoItems} onItemsChange={setObjetoItems} />
      </div>

      <footer className="h-10 bg-yg-dark shrink-0 flex items-center px-1 gap-1 -mx-2 -mb-2 mt-2">
        {(
          [
            { label: 'Novo', action: handleNovo },
            { label: 'Gravar', action: handleGravar },
            { label: 'Consultar', action: handleConsultar, icon: Search },
            { label: 'Limpar', action: handleLimpar },
            {
              label: 'Relatório',
              action: () => toast.info('Relatório não implementado nesta versão.'),
            },
            {
              label: 'Análise',
              action: () => setAnalysisOpen(true),
            },
          ] as Array<{ label: string; action: () => void; icon?: typeof Search }>
        ).map((btn) => {
          const Icon = btn.icon
          return (
            <button
              key={btn.label}
              onClick={btn.action}
              className="flex-1 h-full flex items-center justify-center gap-1 text-yg-gold font-bold text-[12px] border-r border-white/20 last:border-r-0 hover:bg-white/10 transition-colors"
            >
              {Icon ? <Icon className="w-3 h-3" /> : null}
              {btn.label}
            </button>
          )
        })}
      </footer>

      <ValidationDialog
        open={validationOpen}
        message={validationMessage}
        title={validationTitle}
        onClose={handleValidationClose}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
      />

      <EntitySearchModal
        open={entityModal.open}
        onClose={() => setEntityModal({ open: false, type: null })}
        onSelect={handleEntitySelect}
        config={ENTITY_CONFIGS[entityModal.type || 'fornecedor']}
      />

      <AnalysisModal open={analysisOpen} onOpenChange={setAnalysisOpen} />
    </div>
  )
}
