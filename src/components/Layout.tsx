import { Outlet, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'

export default function Layout() {
  const { isAuthenticated, signOut } = useAuth()

  return (
    <main className="min-h-screen bg-yg-bg flex items-center justify-center p-4">
      <div
        className="w-full max-w-[1024px] bg-yg-bg flex flex-col relative overflow-hidden shadow-2xl ring-1 ring-black/10"
        style={{ aspectRatio: '4/3' }}
      >
        <header className="h-8 bg-yg-royal flex items-center justify-between px-2 shrink-0">
          <Link
            to="/"
            className="text-yg-gold font-bold text-[14px] hover:opacity-80 transition-opacity"
          >
            YGPagamentos
          </Link>
          <nav className="flex items-center gap-3">
            <Link to="/" className="text-white text-[11px] hover:text-yg-gold transition-colors">
              Movimentos
            </Link>
            {isAuthenticated && (
              <Link
                to="/import"
                className="text-white text-[11px] hover:text-yg-gold transition-colors"
              >
                Importar
              </Link>
            )}
            {isAuthenticated ? (
              <button
                onClick={signOut}
                className="text-white text-[11px] hover:text-yg-gold transition-colors"
              >
                Sair
              </button>
            ) : (
              <Link
                to="/login"
                className="text-white text-[11px] hover:text-yg-gold transition-colors"
              >
                Entrar
              </Link>
            )}
          </nav>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col p-2 relative">
          <Outlet />
        </div>
      </div>
    </main>
  )
}
