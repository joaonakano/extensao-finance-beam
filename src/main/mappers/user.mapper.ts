import { User } from "@shared/types"

interface UserRow {
    id: number
    user_type_id: number

    name: string
    email: string
    password: string

    created_at: string
}

export function mapUser(row: UserRow): User {
    return {
        id: row.id,

        userTypeId: row.user_type_id,

        name: row.name,
        email: row.email,
        password: row.password,

        createdAt: row.created_at,
    }
}