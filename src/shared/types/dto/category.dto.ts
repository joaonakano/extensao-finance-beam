export interface CreateCategoryDTO {
    name: string
    color: string
    icon?: string | null
}

export interface UpdateCategoryDTO {
    id: number
    name?: string
    color?: string
    icon?: string | null
    status?: 'ativo' | 'inativo'
}