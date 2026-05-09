import { HashRouter, Navigate, Route, Routes } from "react-router-dom"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, AuthUser, useAuth } from "./modules/auth/context"
import { Toaster } from "sonner"
import { LoginPage } from "./modules/auth/components/LoginPage"
import { CadastroPage } from "./modules/auth/components/CadastroPage"
import { DashboardPage } from "./modules/dashboard/components/DashboardPage"
import { GastosPage } from "./modules/gastos/components/GastosPage"
import { PagamentosPage } from "./modules/payment-methods/pages/PagamentosPage"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { DashboardLayout } from "./components/DashboardLayout"

/* FAVOR NAO APAGAR

- Stacks:
- Tailwind + Shadcn/ui: existem componentes prontos como tabelas, formularios e dropdowns, economizando tempo
- React Query: para busca de dados mais simplificada que o Context + useState
- React Hook Form + Zod: validação com tipagem automática, eliminando o uso de todo o codigo de errors, setErrors, validate()
- React Router: para navegar entre paginas

*/

// Inicializando o React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minuto
      retry: false,
    },
  },
})

function RoutesApp() {
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

function App(): React.JSX.Element {
  // const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  // return (
  //   <QueryClientProvider client={queryClient}>
  //     <AuthProvider>
  //       <HashRouter>
  //         <RoutesApp />
  //         <Toaster />
  //       </HashRouter>
  //     </AuthProvider>
  //   </QueryClientProvider>
  // )

  return (
    <h1>
      Teste
    </h1>
  )
}

export default App
