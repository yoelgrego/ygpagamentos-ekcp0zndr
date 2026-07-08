// Mock database to simulate the schema requested
export interface Fornecedor {
  idforn: number
  nome: string
  cnpj_cpf: string
  contato: string
}
export interface Beneficiario {
  idben: number
  nome: string
  documento: string
}
export interface Moeda {
  idmoeda: number
  simbolo: string
  descricao: string
}
export interface Objeto {
  idobj: number
  descricao: string
  tipo: string
}
export interface TipoDoc {
  idtipodoc: number
  descricao: string
}
export interface Pagador {
  idpag: number
  nome: string
}
export interface Catego {
  idcat: number
  descricao: string
}
export interface Natureza {
  idnat: number
  descricao: string
  idcat: number
}
export interface Movimento {
  idmov: number
  ano: number
  mes: number
  dia: number
  valor: number
  idnat: number | null
  idforn: number | null
  idben: number | null
  idpag: number | null
  idtipodoc: number | null
  idmoeda: number | null
  historico: string
  situacao?: string
  cartao?: string
}
export interface MoveObjeto {
  idmoveobj: number
  idmov: number
  idobj: number
  quantidade: number
  valor_unitario: number
}

export const db = {
  fornecedores: [
    { idforn: 1001, nome: 'TechCorp Supplies', cnpj_cpf: '00.000.000/0001-01', contato: 'João' },
    { idforn: 1002, nome: 'Office Master', cnpj_cpf: '11.111.111/0001-11', contato: 'Maria' },
    {
      idforn: 1003,
      nome: 'Serviços de Limpeza Silva',
      cnpj_cpf: '22.222.222/0001-22',
      contato: 'José',
    },
  ] as Fornecedor[],

  beneficiarios: [
    { idben: 201, nome: 'Empresa Alpha', documento: 'DOC001' },
    { idben: 202, nome: 'Fundação Beta', documento: 'DOC002' },
  ] as Beneficiario[],

  moedas: [
    { idmoeda: 10, simbolo: 'R$', descricao: 'Real Brasileiro' },
    { idmoeda: 20, simbolo: 'US$', descricao: 'Dólar Americano' },
    { idmoeda: 30, simbolo: '€', descricao: 'Euro' },
  ] as Moeda[],

  objetos: [
    { idobj: 4001, descricao: 'Computador Desktop', tipo: 'Equipamento' },
    { idobj: 4002, descricao: 'Licença de Software', tipo: 'Serviço' },
    { idobj: 4003, descricao: 'Cadeira de Escritório', tipo: 'Mobiliário' },
  ] as Objeto[],

  tipodocs: [
    { idtipodoc: 101, descricao: 'Nota Fiscal Eletrônica' },
    { idtipodoc: 102, descricao: 'Recibo Simples' },
    { idtipodoc: 103, descricao: 'Fatura de Cartão' },
  ] as TipoDoc[],

  pagadores: [
    { idpag: 301, nome: 'Caixa Central' },
    { idpag: 302, nome: 'Conta Corrente Banco A' },
    { idpag: 303, nome: 'Fundo de Reserva' },
  ] as Pagador[],

  categorias: [
    { idcat: 5001, descricao: 'Despesas Operacionais' },
    { idcat: 5002, descricao: 'Investimentos' },
    { idcat: 5003, descricao: 'Impostos e Taxas' },
  ] as Catego[],

  naturezas: [
    { idnat: 6001, descricao: 'Material de Escritório', idcat: 5001 },
    { idnat: 6002, descricao: 'Equipamentos de TI', idcat: 5002 },
    { idnat: 6003, descricao: 'ISS', idcat: 5003 },
  ] as Natureza[],

  movimentos: [
    {
      idmov: 9000001,
      ano: 2026,
      mes: 7,
      dia: 15,
      valor: 1500.5,
      idnat: 6002,
      idforn: 1001,
      idben: 201,
      idpag: 302,
      idtipodoc: 101,
      idmoeda: 10,
      historico: 'Compra de equipamento',
      situacao: 'Pago',
      cartao: '1234',
    },
  ] as Movimento[],

  moveobjetos: [
    { idmoveobj: 1, idmov: 9000001, idobj: 4001, quantidade: 1, valor_unitario: 1500.5 },
  ] as MoveObjeto[],
}
