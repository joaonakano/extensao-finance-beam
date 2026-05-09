export interface Category {
    id: number
    userId: number

    name: string
    color: string
    icon: string | null

    status: 'ativo' | 'inativo'

    createdAt: string
}