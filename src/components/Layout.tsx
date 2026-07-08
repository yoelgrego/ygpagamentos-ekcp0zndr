import { Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <main className="min-h-screen bg-yg-bg flex items-center justify-center p-4">
      {/* 4:3 Aspect Ratio Container Simulation (max size bounded) */}
      <div
        className="w-full max-w-[1024px] bg-yg-bg flex flex-col relative overflow-hidden shadow-2xl ring-1 ring-black/10"
        style={{ aspectRatio: '4/3' }}
      >
        {/* Header */}
        <header className="h-8 bg-yg-royal flex items-center justify-center shrink-0">
          <h1 className="text-yg-gold font-bold text-[16px] (Arial 12pt approx)">YGPagamentos</h1>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col p-2 gap-2 relative">
          <Outlet />
        </div>

        {/* Footer Navigation */}
        <footer className="h-10 bg-yg-dark shrink-0 flex items-center px-1 gap-1">
          {['Nova Transação', 'Gravar', 'Consultar', 'Selecionar', 'Relatório', 'Análise'].map(
            (btn, i) => (
              <button
                key={btn}
                className="flex-1 h-full flex items-center justify-center text-yg-gold font-bold text-[12px] border-r border-white/20 last:border-r-0 hover:bg-white/10 transition-colors"
              >
                {btn}
              </button>
            ),
          )}
        </footer>
      </div>
    </main>
  )
}
