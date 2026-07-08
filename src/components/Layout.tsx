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
        <div className="flex-1 overflow-hidden flex flex-col p-2 relative">
          <Outlet />
        </div>
      </div>
    </main>
  )
}
