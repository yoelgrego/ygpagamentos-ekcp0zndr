import pb from '@/lib/pocketbase/client'

export interface ObjetoRecord {
  id: string
  idobj: number
  nobj: string
  created: string
  updated: string
}

export const getObjetos = async (): Promise<ObjetoRecord[]> => {
  return await pb.collection('06objeto').getFullList({
    sort: 'idobj',
  })
}

export const createObjeto = async (data: { idobj: number; nobj: string }) => {
  return await pb.collection('06objeto').create(data)
}

export const updateObjeto = async (id: string, data: Partial<{ idobj: number; nobj: string }>) => {
  return await pb.collection('06objeto').update(id, data)
}

export const deleteObjeto = async (id: string) => {
  return await pb.collection('06objeto').delete(id)
}
