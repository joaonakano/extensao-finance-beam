import { useState, useEffect } from 'react'
import { Gastos } from './pages/Gastos'
import { Login } from './pages/Login'
import { Cadastro } from './pages/Cadastro'
import { GastosProvider } from './context/GastosContext'
import { User } from './types/api'
import './App.css'

type Tela = 'login' | 'cadastro' | 'app'

function App() {
  const [tela, setTela] = useState<Tela>('login')
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Restaura a sessão local dps que liga o app
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setUser(parsedUser)
        setTela('app')
      } catch (error) {
        console.error('Erro ao restaurar sessão:', error)
        localStorage.removeItem('user')
      }
    }
    setIsLoading(false)
  }, [])

  const handleLogin = (userData: User) => {
    setUser(userData)
    setTela('app')
    // Salvar sessão localmente
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const handleCadastro = () => {
    setTela('login')
  }

  const handleLogout = () => {
    setUser(null)
    setTela('login')
    localStorage.removeItem('user')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (tela === 'login') {
    return (
      <Login
        onLogin={handleLogin}
        onIrParaCadastro={() => setTela('cadastro')}
      />
    )
  }

  if (tela === 'cadastro') {
    return (
      <Cadastro
        onCadastro={handleCadastro}
        onIrParaLogin={() => setTela('login')}
      />
    )
  }

  return (
    <div className='min-h-screen bg-gray-100'>
      {/* Header com logout */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-blue-600">Finance Beam</h1>
              <p className="text-xs text-gray-500">Bem-vindo, {user?.nome}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700 text-sm">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition font-semibold"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      {user && (
        <GastosProvider userId={user.id}>
          <Gastos />
        </GastosProvider>
      )}
    </div>
  )
}

export default App
