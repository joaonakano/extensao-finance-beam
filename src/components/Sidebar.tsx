import { useState } from 'react'

interface SidebarProps {
  userName: string
  onLogout: () => void
  currentPage: 'dashboard' | 'gastos'
  onPageChange: (page: 'dashboard' | 'gastos') => void
}

export function Sidebar({ userName, onLogout, currentPage, onPageChange }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true)

  const menuItems = [
    { label: 'Dashboard', icon: '📊', page: 'dashboard' as const },
    { label: 'Gastos', icon: '💸', page: 'gastos' as const },
    { label: 'Clientes', icon: '👥', page: 'dashboard' as const, disabled: true },
    { label: 'Relatórios', icon: '📈', page: 'dashboard' as const, disabled: true },
    { label: 'Configurações', icon: '⚙️', page: 'dashboard' as const, disabled: true },
  ]

  const isActive = (page: string) => currentPage === page

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-blue-900 to-blue-800 text-white transition-all duration-300 z-40 ${
          isOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-blue-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-400 rounded-lg flex items-center justify-center font-bold text-lg">
              💰
            </div>
            {isOpen && <span className="font-bold text-lg">Finance Beam</span>}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.page}
              onClick={() => !item.disabled && onPageChange(item.page)}
              disabled={item.disabled}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                item.disabled
                  ? 'opacity-50 cursor-not-allowed text-blue-200'
                  : isActive(item.page)
                  ? 'bg-blue-500 text-white'
                  : 'text-blue-100 hover:bg-blue-700'
              }`}
              title={item.disabled ? 'Em desenvolvimento' : item.label}
            >
              <span className="text-xl">{item.icon}</span>
              {isOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-700 bg-blue-900">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center font-bold">
              {userName?.charAt(0).toUpperCase()}
            </div>
            {isOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{userName}</p>
                <p className="text-xs text-blue-200">Usuário</p>
              </div>
            )}
          </div>
          <button
            onClick={onLogout}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
          >
            {isOpen ? 'Sair' : '🚪'}
          </button>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 bottom-24 z-50 bg-blue-900 hover:bg-blue-800 text-white p-2 rounded-lg transition-colors"
        title={isOpen ? 'Recolher' : 'Expandir'}
      >
        {isOpen ? '◀' : '▶'}
      </button>

      {/* Spacer */}
      <div className={`transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`} />
    </>
  )
}
