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
        }
    }
}
