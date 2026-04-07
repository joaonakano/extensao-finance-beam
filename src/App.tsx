import { useState } from 'react'
import { Gastos } from './pages/Gastos'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className='min-h-screen bg-gray-100'>
        <Gastos />
      </div>
    </>
  )
}

export default App
