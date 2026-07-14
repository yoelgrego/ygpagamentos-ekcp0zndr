import type { EntityConfig } from '@/components/EntitySearchModal'

export const ENTITY_CONFIGS: Record<string, EntityConfig> = {
  fornecedor: {
    collection: '03fornecedor',
    idField: 'idfornece',
    nameField: 'nofornece',
    title: 'Fornecedor',
  },
  beneficiario: {
    collection: '04beneficiario',
    idField: 'idbenef',
    nameField: 'nobenef',
    title: 'Beneficiário',
  },
  moeda: {
    collection: '05moeda',
    idField: 'idmoeda',
    nameField: 'nomoeda',
    title: 'Seleção de Moeda',
    requiredNameMessage: 'Nome da moeda é OBRIGATÓRIO',
  },
  tipodoc: {
    collection: '07tipodoc',
    idField: 'idtipo',
    nameField: 'notipo',
    title: 'Tipo de Documento',
  },
  pagador: {
    collection: '08pagador',
    idField: 'idpaga',
    nameField: 'nopaga',
    title: 'Pagador',
  },
  categoria: {
    collection: '09catego',
    idField: 'idcat',
    nameField: 'nocat',
    title: 'Categoria',
  },
  natureza: {
    collection: '10natureza',
    idField: 'idnat',
    nameField: 'nonat',
    title: 'Natureza',
  },
  objeto: {
    collection: '06objeto',
    idField: 'idobj',
    nameField: 'nobj',
    title: 'Objeto',
  },
}

export const FORM_FIELD_MAP: Record<string, { idField: string; nameField: string }> = {
  fornecedor: { idField: 'idfornNum', nameField: 'fornName' },
  beneficiario: { idField: 'idbenNum', nameField: 'benName' },
  moeda: { idField: 'idmoedaNum', nameField: 'moedaName' },
  tipodoc: { idField: 'idtipodocNum', nameField: 'tipoDocName' },
  pagador: { idField: 'idpagNum', nameField: 'pagadorName' },
  categoria: { idField: 'idcatNum', nameField: 'catName' },
  natureza: { idField: 'idnatNum', nameField: 'natName' },
}
