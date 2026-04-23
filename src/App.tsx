import { useState, useEffect } from 'react'
import { Gastos } from './pages/Gastos'
import { Dashboard } from './pages/Dashboard'
import { MeiosPagamento } from './pages/MeiosPagamento'
import { Login } from './pages/Login'
import { Cadastro } from './pages/Cadastro'
import { Sidebar } from './components/Sidebar'
import { GastosProvider } from './context/GastosContext'
import { MeiosPagamentoProvider } from './context/MeiosPagamentoContext'
import { User } from './types/api'
import './App.css'

type Tela = 'login' | 'cadastro' | 'app'
type Pagina = 'dashboard' | 'gastos' | 'meios-pagamento'

function App() {
  const [tela, setTela] = useState<Tela>('login')
  const [paginaAtual, setPaginaAtual] = useState<Pagina>('dashboard')
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
    setPaginaAtual('dashboard')
    // Salvar sessão localmente
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const handleCadastro = () => {
    setTela('login')
  }

  const handleLogout = () => {
    setUser(null)
    setTela('login')
    setPaginaAtual('dashboard')
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
    <div className='min-h-screen bg-gray-50 flex'>
      {/* Sidebar */}
      {user && (
        <Sidebar 
          userName={user.nome} 
          onLogout={handleLogout}
          currentPage={paginaAtual}
          onPageChange={setPaginaAtual}
        />
      )}

      {/* Conteúdo Principal */}
      <div className='flex-1 flex flex-col'>
        {user && (
          <GastosProvider userId={user.id}>
            <MeiosPagamentoProvider userId={user.id}>
              {paginaAtual === 'dashboard' && <Dashboard />}
              {paginaAtual === 'gastos' && <Gastos />}
              {paginaAtual === 'meios-pagamento' && <MeiosPagamento />}
            </MeiosPagamentoProvider>
          </GastosProvider>
        )}
      </div>
    </div>
  )
}

export default App
