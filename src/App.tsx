import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'


import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Toaster } from '@/components/ui/toaster'
import { LoginPage } from './pages/auth/components/LoginPage'
import { AuthProvider, AuthUser, useAuth } from './pages/auth/context'
import { CadastroPage } from './pages/auth/components/CadastroPage'
import { DashboardLayout } from './components/DashboardLayout'
import { DashboardPage } from './pages/dashboard/components/DashboardPage'
import { GastosPage } from './pages/gastos/components/GastosPage'
import { PagamentosPage } from './pages/Pagamentos/PagamentosPage'

/* FAVOR NAO APAGAR

- Tailwind + Shadcn/ui: existem componentes prontos como tabelas, formularios e dropdowns, economizando tempo
- React Query: para busca de dados mais simplificada que o Context + useState
- React Hook Form + Zod: validação com tipagem automática, eliminando o uso de todo o codigo de errors, setErrors, validate()
- React Router: para navegar entre paginas

*/

const queryClient = new QueryClient()

function AppRoutes() {
  const { user, setUser } = useAuth()

  return (
    <Routes>
      <Route path='/' element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />

      <Route path='/login' element={<LoginPage onLogin={(u: AuthUser) => setUser(u)} />} />
      <Route path='/cadastro' element={<CadastroPage />} />

      <Route element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route path='/dashboard' element={<DashboardPage userId={user?.id ?? 1} />} />
        <Route path='/gastos' element={<GastosPage userId={user?.id ?? 1} />} />
        <Route path='/pagamentos' element={<PagamentosPage />} />
      </Route>

      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <HashRouter>
          <AppRoutes />
          <Toaster />
        </HashRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
