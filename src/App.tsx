import './App.css'

import { GastosPage } from './features/gastos/components/GastosPage'

// Importando o React Router
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'

/*

Para melhorar o tratamento do app e não virar bola de neve, estão algumas mudanças

- Tailwind + Shadcn/ui: existem componentes prontos como tabelas, formularios e dropdowns, economizando tempo
- React Query: para busca de dados mais simplificada que o Context + useState
- React Hook Form + Zod: validação com tipagem automática, eliminando o uso de todo o codigo de errors, setErrors, validate()
- React Router: para navegar entre paginas

*/

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path='/' element={<Navigate to="/gastos" />} />
        <Route path='/gastos' element={<GastosPage />} />
      </Routes>
    </HashRouter>
  )
}

export default App
