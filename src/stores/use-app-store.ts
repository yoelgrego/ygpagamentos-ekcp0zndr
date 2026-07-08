import { create } from 'zustand'
import { api } from '@/services/api'

interface AppState {
  fornecedores: any[]
  beneficiarios: any[]
  moedas: any[]
  objetos: any[]
  tipodocs: any[]
  pagadores: any[]
  categorias: any[]
  naturezas: any[]
  movimentos: any[]
  moveobjetos: any[]
  loading: boolean
  fetchLookups: () => Promise<void>
  fetchMovimentos: () => Promise<void>
}

export const useAppStore = create<AppState>((set) => ({
  fornecedores: [],
  beneficiarios: [],
  moedas: [],
  objetos: [],
  tipodocs: [],
  pagadores: [],
  categorias: [],
  naturezas: [],
  movimentos: [],
  moveobjetos: [],
  loading: false,
  fetchLookups: async () => {
    set({ loading: true })
    try {
      const [f, b, m, o, t, p, c, n] = await Promise.all([
        api.fornecedores.list(),
        api.beneficiarios.list(),
        api.moedas.list(),
        api.objetos.list(),
        api.tipodocs.list(),
        api.pagadores.list(),
        api.categorias.list(),
        api.naturezas.list(),
      ])
      set({
        fornecedores: f,
        beneficiarios: b,
        moedas: m,
        objetos: o,
        tipodocs: t,
        pagadores: p,
        categorias: c,
        naturezas: n,
        loading: false,
      })
    } catch (e) {
      console.error(e)
      set({ loading: false })
    }
  },
  fetchMovimentos: async () => {
    try {
      const [movs, mobjs] = await Promise.all([api.movimentos.list(), api.moveobjetos.list()])
      set({ movimentos: movs, moveobjetos: mobjs })
    } catch (e) {
      console.error(e)
    }
  },
}))
