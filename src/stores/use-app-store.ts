import { useSyncExternalStore } from 'react'
import { api } from '@/services/api'

interface AppState {
  movimentos: any[]
  fornecedores: any[]
  beneficiarios: any[]
  moedas: any[]
  objetos: any[]
  tipodocs: any[]
  pagadores: any[]
  categorias: any[]
  naturezas: any[]
  loading: boolean
  error: string | null
}

const initialState: AppState = {
  movimentos: [],
  fornecedores: [],
  beneficiarios: [],
  moedas: [],
  objetos: [],
  tipodocs: [],
  pagadores: [],
  categorias: [],
  naturezas: [],
  loading: false,
  error: null,
}

let currentState = initialState
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((l) => l())
}

function updateState(updater: (prev: AppState) => AppState) {
  currentState = updater(currentState)
  notify()
}

async function fetchLookups() {
  try {
    const [
      fornecedores,
      beneficiarios,
      moedas,
      objetos,
      tipodocs,
      pagadores,
      categorias,
      naturezas,
    ] = await Promise.all([
      api.fornecedores.list(),
      api.beneficiarios.list(),
      api.moedas.list(),
      api.objetos.list(),
      api.tipodocs.list(),
      api.pagadores.list(),
      api.categorias.list(),
      api.naturezas.list(),
    ])
    updateState((prev) => ({
      ...prev,
      fornecedores,
      beneficiarios,
      moedas,
      objetos,
      tipodocs,
      pagadores,
      categorias,
      naturezas,
    }))
  } catch (err: any) {
    updateState((prev) => ({ ...prev, error: 'Erro ao carregar dados auxiliares' }))
  }
}

async function fetchMovimentos() {
  updateState((prev) => ({ ...prev, loading: true, error: null }))
  try {
    const movimentos = await api.movimentos.list()
    updateState((prev) => ({ ...prev, movimentos, loading: false }))
  } catch (err: any) {
    updateState((prev) => ({
      ...prev,
      movimentos: [],
      loading: false,
      error: 'Erro ao carregar movimentos. Verifique a conexão com o servidor.',
    }))
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot() {
  return currentState
}

export function useAppStore() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  return {
    ...snapshot,
    fetchLookups,
    fetchMovimentos,
  }
}

export default useAppStore
