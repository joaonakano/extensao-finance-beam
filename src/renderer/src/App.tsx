import { HashRouter, Navigate, Route, Routes } from "react-router-dom"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from "./modules/auth/context"
import type { AuthUser } from "./modules/auth/context"
import { Toaster } from "sonner"
import { LoginPage } from "./modules/auth/components/LoginPage"
import { CadastroPage } from "./modules/auth/components/CadastroPage"
import { DashboardPage } from "./modules/dashboard/components/DashboardPage"
import { GastosPage } from "./modules/gastos/components/GastosPage"
import { PagamentosPage } from "./modules/payment-methods/pages/PagamentosPage"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { DashboardLayout } from "./components/DashboardLayout"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60, retry: false },
  },
})

function RoutesApp() {
  const { user, setUser } = useAuth()

  function handleLogin(u: AuthUser) {
    setUser(u)
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to={user ? "/gastos" : "/login"} replace />} />

      <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
      <Route path="/cadastro" element={<CadastroPage />} />

      <Route element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={<DashboardPage userId={user?.id ?? 0} />} />
        <Route path="/gastos" element={<GastosPage userId={user?.id ?? 0} />} />
        <Route path="/pagamentos" element={<PagamentosPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App(): React.JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <HashRouter>
          <RoutesApp />
          <Toaster richColors />
        </HashRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
