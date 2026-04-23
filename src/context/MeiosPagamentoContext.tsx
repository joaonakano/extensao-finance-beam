import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export interface MeioPagamento {
    id?: number
    descricao: string
    tipo: string
    status: 'ativo' | 'inativo'
    user_id?: number
    created_at?: string
}

interface MeiosPagamentoContextType {
    meios: MeioPagamento[]
    loading: boolean
    error: string | null
    createMeio: (meio: Omit<MeioPagamento, 'id'>) => Promise<{ success: boolean; error?: string }>
    updateMeio: (meio: MeioPagamento & { id: number }) => Promise<{ success: boolean; error?: string }>
    toggleStatus: (id: number) => Promise<{ success: boolean; error?: string }>
    deleteMeio: (id: number) => Promise<{ success: boolean; error?: string }>
    refreshMeios: () => Promise<void>
}

const MeiosPagamentoContext = createContext<MeiosPagamentoContextType | null>(null)

interface Props {
    children: ReactNode
    userId: number
}

export function MeiosPagamentoProvider({ children, userId }: Props) {
    const [meios, setMeios] = useState<MeioPagamento[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function refreshMeios() {
        try {
            setLoading(true)
            setError(null)
            const data = await window.api.meiosPagamento.getAll(userId)
            setMeios(data)
        } catch (err) {
            setError('Erro ao carregar meios de pagamento')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    async function createMeio(meio: Omit<MeioPagamento, 'id'>) {
        try {
            setError(null)
            const result = await window.api.meiosPagamento.create({ ...meio, user_id: userId })
            await refreshMeios()
            return { success: true }
        } catch (err) {
            setError('Erro ao criar meio de pagamento')
            console.error(err)
            return { success: false, error: 'Erro ao criar meio de pagamento' }
        }
    }

    async function updateMeio(meio: MeioPagamento & { id: number }) {
        try {
            setError(null)
            const result = await window.api.meiosPagamento.update({
                id: meio.id,
                descricao: meio.descricao,
                tipo: meio.tipo,
                status: meio.status,
            })
            if (result.success) await refreshMeios()
            return result
        } catch (err) {
            console.error(err)
            return { success: false, error: 'Erro ao atualizar meio de pagamento' }
        }
    }

    async function toggleStatus(id: number) {
        try {
            setError(null)
            const result = await window.api.meiosPagamento.toggleStatus(id)
            if (result.success) await refreshMeios()
            return result
        } catch (err) {
            console.error(err)
            return { success: false, error: 'Erro ao alterar status' }
        }
    }

    async function deleteMeio(id: number) {
        try {
            setError(null)
            const result = await window.api.meiosPagamento.delete(id)
            if (result.success) await refreshMeios()
            return result
        } catch (err) {
            console.error(err)
            return { success: false, error: 'Erro ao excluir meio de pagamento' }
        }
    }

    useEffect(() => {
        refreshMeios()
    }, [userId])

    return (
        <MeiosPagamentoContext.Provider value={{
            meios,
            loading,
            error,
            createMeio,
            updateMeio,
            toggleStatus,
            deleteMeio,
            refreshMeios,
        }}>
            {children}
        </MeiosPagamentoContext.Provider>
    )
}

export function useMeiosPagamento() {
    const context = useContext(MeiosPagamentoContext)
    if (!context) {
        throw new Error('useMeiosPagamento deve estar dentro do MeiosPagamentoProvider')
    }
    return context
}
