import { Category } from "@shared/types"

interface CategoryRow {
    id: number
    user_id: number

    name: string
    color: string
    icon: string | null

    status: 'ativo' | 'inativo'

    created_at: string
}

export function mapCategory(
    row: CategoryRow
): Category {
    return {
        id: row.id,

        userId: row.user_id,

        name: row.name,
        color: row.color,
        icon: row.icon,

        status: row.status,

        createdAt: row.created_at,
    }
}