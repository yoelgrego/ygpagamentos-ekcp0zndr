import pb from '@/lib/pocketbase/client'

export const api = {
  fornecedores: { list: () => pb.collection('03fornecedor').getFullList({ sort: 'idfornece' }) },
  beneficiarios: { list: () => pb.collection('04beneficiario').getFullList({ sort: 'idbenef' }) },
  moedas: { list: () => pb.collection('05moeda').getFullList({ sort: 'idmoeda' }) },
  objetos: { list: () => pb.collection('06objeto').getFullList({ sort: 'idobj' }) },
  tipodocs: { list: () => pb.collection('07tipodoc').getFullList({ sort: 'idtipo' }) },
  pagadores: { list: () => pb.collection('08pagador').getFullList({ sort: 'idpaga' }) },
  categorias: { list: () => pb.collection('09catego').getFullList({ sort: 'idcat' }) },
  naturezas: { list: () => pb.collection('10natureza').getFullList({ sort: 'idnat' }) },
  movimentos: {
    list: () => pb.collection('01movimento').getFullList({ sort: '-idm' }),
    create: (data: any) => pb.collection('01movimento').create(data),
    update: (id: string, data: any) => pb.collection('01movimento').update(id, data),
    delete: (id: string) => pb.collection('01movimento').delete(id),
  },
  moveobjetos: {
    list: () => pb.collection('02moveobjeto').getFullList({ expand: 'idobj' }),
    create: (data: any) => pb.collection('02moveobjeto').create(data),
    delete: (id: string) => pb.collection('02moveobjeto').delete(id),
  },
  clearMovimentos: () => pb.send('/backend/v1/clear-movimentos', { method: 'POST' }),
}
