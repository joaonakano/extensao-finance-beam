import { HashRouter, Navigate, Route, Routes } from "react-router-dom"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from "@features/auth/context"
import type { AuthUser } from "@features/auth/context"
import { Toaster } from "sonner"
import { LoginPage } from "@features/auth/components/LoginPage"
import { CadastroPage } from "@features/auth/components/CadastroPage"
import { DashboardPage } from "@features/dashboard/components/DashboardPage"
import { PagamentosPage } from "@features/payment-methods/pages/PagamentosPage"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { DashboardLayout } from "@/components/DashboardLayout"
import { ExpensePage } from "@/features/expenses/pages/expense-dashboard.page"

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
        <Route path="/gastos" element={<ExpensePage />} />
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
