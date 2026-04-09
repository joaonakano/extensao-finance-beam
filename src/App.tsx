import { useState } from 'react'
import { Gastos } from './pages/Gastos'
import { Login } from './pages/Login'
import { Cadastro } from './pages/Cadastro'
import './App.css'

type Tela = 'login' | 'cadastro' | 'app'

function App() {
  const [tela, setTela] = useState<Tela>('login')

  if (tela === 'login') {
    return (
      <Login
        onLogin={() => setTela('app')}
        onIrParaCadastro={() => setTela('cadastro')}
      />
    )
  }

  if (tela === 'cadastro') {
    return (
      <Cadastro
        onCadastro={() => setTela('login')}
        onIrParaLogin={() => setTela('login')}
      />
    )
  }

  return (
    <div className='min-h-screen bg-gray-100'>
      <Gastos />
    </div>
  )
}

export default App