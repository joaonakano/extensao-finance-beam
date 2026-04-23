export interface Gasto {
    id?: number
    descricao: string
    total: number
    categoria: string
    data: string
    user_id?: number
}

export interface User {
    id: number
    nome: string
    email: string
}

export interface LoginResponse {
    success: boolean
    user?: User
    error?: string
}

export interface RegisterResponse {
    success: boolean
    user?: User
    error?: string
}

export interface CheckEmailResponse {
    exists: boolean
}

export interface MeioPagamento {
    id?: number
    descricao: string
    tipo: string
    status: 'ativo' | 'inativo'
    user_id?: number
    created_at?: string
}

declare global {
    interface Window {
        api: {
            auth: {
                login: (email: string, senha: string) => Promise<LoginResponse>
                register: (nome: string, email: string, senha: string) => Promise<RegisterResponse>
                checkEmail: (email: string) => Promise<CheckEmailResponse>
            }
            gastos: {
                getAll: (userId: number) => Promise<Gasto[]>
                getById: (id: number) => Promise<Gasto>
                create: (gasto: Omit<Gasto, 'id'> & { user_id: number }) => Promise<Gasto>
                delete: (id: number) => Promise<{ success: boolean }>
            }
            meiosPagamento: {
                getAll: (userId: number) => Promise<MeioPagamento[]>
                create: (meio: Omit<MeioPagamento, 'id'> & { user_id: number }) => Promise<MeioPagamento & { success: boolean }>
                update: (meio: Required<Pick<MeioPagamento, 'id'>> & Omit<MeioPagamento, 'id' | 'user_id' | 'created_at'>) => Promise<{ success: boolean; error?: string }>
                toggleStatus: (id: number) => Promise<{ success: boolean; error?: string }>
                delete: (id: number) => Promise<{ success: boolean; error?: string }>
            }
        }
    }
}
