import { create } from 'zustand'
import { db, Movimento, MoveObjeto } from '@/lib/mock-db'

interface AppState {
  movimentos: Movimento[]
  moveobjetos: MoveObjeto[]
  addMovimento: (mov: Movimento) => void
  addMoveObjeto: (mo: MoveObjeto) => void
}

export const useAppStore = create<AppState>((set) => ({
  movimentos: [...db.movimentos],
  moveobjetos: [...db.moveobjetos],
  addMovimento: (mov) => set((state) => ({ movimentos: [...state.movimentos, mov] })),
  addMoveObjeto: (mo) => set((state) => ({ moveobjetos: [...state.moveobjetos, mo] })),
}))
