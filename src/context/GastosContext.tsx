import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface Gasto {
    id?: number
    descricao: string
    total: number
    categoria: string
    data: string
}

interface GastosContextType {
    gastos: Gasto[]
    loading: boolean
    error: string | null
    userId: number
    createGasto: (gasto: Omit<Gasto, 'id'>) => Promise<void>
    deleteGasto: (id: number) => Promise<void>
    refreshGastos: () => Promise<void>
}

const GastosContext = createContext<GastosContextType | null>(null)

interface GastosProviderProps {
    children: ReactNode
    userId: number
}

export function GastosProvider({ children, userId }: GastosProviderProps) {
    const [gastos, setGastos] = useState<Gasto[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function refreshGastos() {
        try {
            setLoading(true)
            setError(null)
            const data = await window.api.gastos.getAll(userId)
            setGastos(data)
        } catch (err) {
            setError('Erro ao carregar gastos')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    async function createGasto(gasto: Omit<Gasto, 'id'>) {
        try {
            setError(null)
            await window.api.gastos.create({ ...gasto, user_id: userId })
            await refreshGastos()   // atualizar lista após criar gasto
        } catch (err) {
            setError('Erro ao criar gasto')
            console.error(err)
        }
    }

    async function deleteGasto(id: number) {
        try {
            setError(null)
            await window.api.gastos.delete(id)
            await refreshGastos()   // atualizar lista após deletar gasto
        } catch (err) {
            setError('Erro ao deletar gasto')
            console.error(err)
        }
    }

    // Carregar os Gastos logo na Montagem da Pagina
    useEffect(() => {
        refreshGastos()
    }, [userId])

    return (
        <GastosContext.Provider value={{
            gastos,
            loading,
            error,
            userId,
            createGasto,
            deleteGasto,
            refreshGastos
        }}>
            {children}
        </GastosContext.Provider>
    )
}

// Hook customizado para facilitar o consumo
export function useGastos() {
    const context = useContext(GastosContext)
    if (!context) {
        throw new Error('useGastos deve estar dentro do GastosProvider')
    }
    return context
}