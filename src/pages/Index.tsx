import { useState, useMemo } from 'react'
import { YgLabel, YgInput, YgButton, YgFieldGroup } from '@/components/yg-ui'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { db, Movimento } from '@/lib/mock-db'
import { useAppStore } from '@/stores/use-app-store'
import { toast } from 'sonner'

// Utility to estimate width based on character count
const w = (chars: number) => `${chars * 8 + 12}px`

type LookupType =
  | 'fornecedor'
  | 'beneficiario'
  | 'moeda'
  | 'tipodoc'
  | 'pagador'
  | 'categoria'
  | 'natureza'
  | 'objeto'
  | null

export default function Index() {
  const { movimentos, moveobjetos, addMovimento } = useAppStore()

  // Form State
  const [formData, setFormData] = useState({
    id: '9000002',
    ano: '2026',
    mes: '07',
    dia: '08',
    idforn: '',
    fornName: '',
    idben: '',
    benName: '',
    idmoeda: '',
    moedaName: '',
    valor: '',
    cartao: '',
    idtipodoc: '',
    tipoDocName: '',
    idpag: '',
    pagadorName: '',
    situacao: 'Pendente',
    idcat: '',
    catName: '',
    idnat: '',
    natName: '',
    idobj: '',
    objName: '',
  })

  // Lookup Modal State
  const [lookup, setLookup] = useState<{ isOpen: boolean; type: LookupType }>({
    isOpen: false,
    type: null,
  })

  const handleLookup = (type: LookupType) => {
    setLookup({ isOpen: true, type })
  }

  const handleSelect = (record: any) => {
    switch (lookup.type) {
      case 'fornecedor':
        setFormData((p) => ({ ...p, idforn: record.idforn.toString(), fornName: record.nome }))
        break
      case 'beneficiario':
        setFormData((p) => ({ ...p, idben: record.idben.toString(), benName: record.nome }))
        break
      case 'moeda':
        setFormData((p) => ({
          ...p,
          idmoeda: record.idmoeda.toString(),
          moedaName: record.descricao,
        }))
        break
      case 'tipodoc':
        setFormData((p) => ({
          ...p,
          idtipodoc: record.idtipodoc.toString(),
          tipoDocName: record.descricao,
        }))
        break
      case 'pagador':
        setFormData((p) => ({ ...p, idpag: record.idpag.toString(), pagadorName: record.nome }))
        break
      case 'categoria':
        setFormData((p) => ({ ...p, idcat: record.idcat.toString(), catName: record.descricao }))
        // Auto clear natureza if category changes
        setFormData((p) => ({ ...p, idnat: '', natName: '' }))
        break
      case 'natureza':
        setFormData((p) => ({ ...p, idnat: record.idnat.toString(), natName: record.descricao }))
        break
      case 'objeto':
        setFormData((p) => ({ ...p, idobj: record.idobj.toString(), objName: record.descricao }))
        break
    }
    setLookup({ isOpen: false, type: null })
  }

  // Get data for current lookup modal
  const lookupData = useMemo(() => {
    switch (lookup.type) {
      case 'fornecedor':
        return { headers: ['ID', 'Nome', 'CNPJ/CPF'], data: db.fornecedores }
      case 'beneficiario':
        return { headers: ['ID', 'Nome', 'Documento'], data: db.beneficiarios }
      case 'moeda':
        return { headers: ['ID', 'Símbolo', 'Descrição'], data: db.moedas }
      case 'tipodoc':
        return { headers: ['ID', 'Descrição'], data: db.tipodocs }
      case 'pagador':
        return { headers: ['ID', 'Nome'], data: db.pagadores }
      case 'categoria':
        return { headers: ['ID', 'Descrição'], data: db.categorias }
      case 'natureza':
        // Filter by selected category if any
        return {
          headers: ['ID', 'Descrição'],
          data: formData.idcat
            ? db.naturezas.filter((n) => n.idcat.toString() === formData.idcat)
            : db.naturezas,
        }
      case 'objeto':
        return { headers: ['ID', 'Descrição', 'Tipo'], data: db.objetos }
      default:
        return { headers: [], data: [] }
    }
  }, [lookup.type, formData.idcat])

  const renderModalRow = (row: any, i: number) => {
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
      case 'objeto':
        return (
          <>
            <td className="p-1 border">{row.idobj}</td>
            <td className="p-1 border">{row.descricao}</td>
            <td className="p-1 border">{row.tipo}</td>
          </>
        )
      default:
        return null
    }
  }

  // Derived view data for the main grid (V1movimento logic)
  const v1Movimentos = useMemo(() => {
    return movimentos.map((m) => {
      const nat = db.naturezas.find((n) => n.idnat === m.idnat)
      const cat = db.categorias.find((c) => c.idcat === nat?.idcat)
      const forn = db.fornecedores.find((f) => f.idforn === m.idforn)
      const ben = db.beneficiarios.find((b) => b.idben === m.idben)
      const pag = db.pagadores.find((p) => p.idpag === m.idpag)
      const tipo = db.tipodocs.find((t) => t.idtipodoc === m.idtipodoc)
      const moe = db.moedas.find((mo) => mo.idmoeda === m.idmoeda)

      return {
        ...m,
        fornecedorNome: forn?.nome || '',
        beneficiarioNome: ben?.nome || '',
        moedaSimbolo: moe?.simbolo || '',
        tipoDocDesc: tipo?.descricao || '',
        pagadorNome: pag?.nome || '',
        categoriaDesc: cat?.descricao || '',
        naturezaDesc: nat?.descricao || '',
      }
    })
  }, [movimentos])

  return (
    <div className="flex flex-col h-full gap-2">
      {/* Top Section: Form + Object Box */}
      <div className="flex gap-2 shrink-0">
        {/* Left Side: Main Form Fields */}
        <div className="flex flex-col gap-2 flex-1 pt-1">
          {/* Linha 1 */}
          <div className="flex gap-2">
            <YgFieldGroup>
              <YgLabel>ID</YgLabel>
              <YgInput
                style={{ width: w(7) }}
                value={formData.id}
                readOnly
                className="bg-gray-100"
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

          {/* Linha 2 */}
          <div className="flex gap-2">
            <YgFieldGroup>
              <YgLabel>Fornecedor</YgLabel>
              <div className="flex">
                <YgInput style={{ width: w(6) }} value={formData.idforn} readOnly />
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

          {/* Linha 3 */}
          <div className="flex gap-2">
            <YgFieldGroup>
              <YgLabel>Beneficiário</YgLabel>
              <div className="flex">
                <YgInput style={{ width: w(4) }} value={formData.idben} readOnly />
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

          {/* Linha 4 */}
          <div className="flex gap-2">
            <YgFieldGroup>
              <YgLabel>Moeda</YgLabel>
              <div className="flex">
                <YgInput style={{ width: w(3) }} value={formData.idmoeda} readOnly />
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
                style={{ width: w(8) }}
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

          {/* Linha 5 */}
          <div className="flex gap-2">
            <YgFieldGroup>
              <YgLabel>Tipo de Documento</YgLabel>
              <div className="flex">
                <YgInput style={{ width: w(3) }} value={formData.idtipodoc} readOnly />
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
                <YgInput style={{ width: w(3) }} value={formData.idpag} readOnly />
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

          {/* Linha 6 */}
          <div className="flex gap-2">
            <YgFieldGroup>
              <YgLabel>Categoria</YgLabel>
              <div className="flex">
                <YgInput style={{ width: w(4) }} value={formData.idcat} readOnly />
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
                <YgInput style={{ width: w(4) }} value={formData.idnat} readOnly />
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

        {/* Right Side: Object Box */}
        <div className="w-[30%] border border-yg-dark flex flex-col p-[2px] bg-white h-[200px]">
          <div className="p-1 pb-2">
            <YgFieldGroup>
              <YgLabel>Objeto</YgLabel>
              <div className="flex mb-1">
                <YgInput style={{ width: w(4) }} value={formData.idobj} readOnly />
                <YgButton onClick={() => handleLookup('objeto')}>?</YgButton>
              </div>
              <YgInput className="w-full bg-gray-50" value={formData.objName} readOnly />
            </YgFieldGroup>

            <div className="flex gap-1 mt-2 mb-2 bg-gray-200 p-[2px] justify-start">
              {['N', 'A', 'E', 'D'].map((action) => (
                <button
                  key={action}
                  className="h-[20px] w-[24px] bg-gray-300 border border-gray-500 text-black text-[10px] font-bold hover:bg-gray-400"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-auto yg-scrollbar border-t border-yg-dark">
            <table className="w-full text-[11px] text-left border-collapse">
              <thead className="bg-yg-dark text-white sticky top-0">
                <tr>
                  <th className="font-bold p-1 border-r border-white/20">IdObj</th>
                  <th className="font-bold p-1">NObj</th>
                </tr>
              </thead>
              <tbody>
                {moveobjetos
                  .filter((mo) => mo.idmov.toString() === formData.id)
                  .map((mo) => {
                    const obj = db.objetos.find((o) => o.idobj === mo.idobj)
                    return (
                      <tr key={mo.idmoveobj} className="border-b border-gray-200 hover:bg-sky-50">
                        <td className="p-1 border-r">{mo.idobj}</td>
                        <td className="p-1 truncate max-w-[120px]">{obj?.descricao}</td>
                      </tr>
                    )
                  })}
                {/* Empty rows to match design */}
                <tr className="border-b border-gray-200 h-[22px]">
                  <td className="border-r"></td>
                  <td></td>
                </tr>
                <tr className="border-b border-gray-200 h-[22px]">
                  <td className="border-r"></td>
                  <td></td>
                </tr>
                <tr className="border-b border-gray-200 h-[22px]">
                  <td className="border-r"></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom Section: Main Data Grid */}
      <div className="flex-1 overflow-auto yg-scrollbar border border-gray-400 bg-white shadow-inner mt-2">
        <table className="text-[11px] text-left border-collapse whitespace-nowrap min-w-max">
          <thead className="bg-yg-dark text-white sticky top-0 z-10">
            <tr>
              {[
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
              ].map((col) => (
                <th key={col} className="font-bold p-1 px-2 border-r border-white/20">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {v1Movimentos.map((row, i) => (
              <tr
                key={row.idmov}
                className="border-b border-gray-200 hover:bg-sky-100 cursor-pointer"
              >
                <td className="p-1 px-2 border-r">{row.idmov}</td>
                <td className="p-1 px-2 border-r">{row.ano}</td>
                <td className="p-1 px-2 border-r">{row.mes.toString().padStart(2, '0')}</td>
                <td className="p-1 px-2 border-r">{row.dia.toString().padStart(2, '0')}</td>
                <td className="p-1 px-2 border-r">{row.idforn || ''}</td>
                <td className="p-1 px-2 border-r">{row.fornecedorNome}</td>
                <td className="p-1 px-2 border-r">{row.idben || ''}</td>
                <td className="p-1 px-2 border-r">{row.beneficiarioNome}</td>
                <td className="p-1 px-2 border-r">{row.idmoeda || ''}</td>
                <td className="p-1 px-2 border-r">{row.moedaSimbolo}</td>
                <td className="p-1 px-2 border-r text-right">{row.valor.toFixed(2)}</td>
                <td className="p-1 px-2 border-r">{row.cartao || ''}</td>
                <td className="p-1 px-2 border-r">{row.idtipodoc || ''}</td>
                <td className="p-1 px-2 border-r">{row.tipoDocDesc}</td>
                <td className="p-1 px-2 border-r">{row.idpag || ''}</td>
                <td className="p-1 px-2 border-r">{row.pagadorNome}</td>
                <td className="p-1 px-2 border-r">{row.situacao || ''}</td>
                <td className="p-1 px-2 border-r">
                  {row.idnat ? db.naturezas.find((n) => n.idnat === row.idnat)?.idcat : ''}
                </td>
                <td className="p-1 px-2 border-r">{row.categoriaDesc}</td>
                <td className="p-1 px-2 border-r">{row.idnat || ''}</td>
                <td className="p-1 px-2 border-r">{row.naturezaDesc}</td>
              </tr>
            ))}
            {/* Fill empty rows to make it look like a classic grid */}
            {[...Array(10)].map((_, i) => (
              <tr key={`empty-${i}`} className="border-b border-gray-200 h-[24px]">
                {[...Array(21)].map((_, j) => (
                  <td key={j} className="border-r"></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Lookup Modal */}
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
                    {renderModalRow(row, i)}
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
