import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

import { AuthProvider, useAuth } from '@/features/auth/context'
import { LoginPage } from '@/features/auth/components/LoginPage'
import { CadastroPage } from '@/features/auth/components/CadastroPage'
import { GastosPage } from '@/features/gastos/components/GastosPage'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Toaster } from '@/components/ui/toaster'
import type { AuthUser } from '@/features/auth/context'
import { DashboardLayout } from './components/DashboardLayout'
import { PagamentosPage } from './features/meiosPagamento/components/PagamentosPage'

const queryClient = new QueryClient()

function AppRoutes() {
  const { user, setUser } = useAuth()

  return (
    <Routes>
      {/* Rota raiz → redireciona baseado em auth */}
      <Route path='/' element={<Navigate to={user ? '/gastos' : '/login'} replace />} />

      {/* Páginas públicas */}
      <Route path='/login' element={<LoginPage onLogin={(u: AuthUser) => setUser(u)} />} />
      <Route path='/cadastro' element={<CadastroPage />} />

      {/* Páginas protegidas */}
      <Route element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>

        <Route path='/gastos' element={<GastosPage userId={user?.id ?? 1} />} />
        <Route path='/pagamentos' element={<PagamentosPage />} />
      </Route>
      
      {/* Fallback */}
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
