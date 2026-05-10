import { PaymentMethod } from "@shared/types"

interface PaymentMethodRow {
    id: number
    user_id: number

    name: string
    type: string

    status: 'ativo' | 'inativo'

    created_at: string
}

export function mapPaymentMethod(
    row: PaymentMethodRow
): PaymentMethod {
    return {
        id: row.id,

        userId: row.user_id,

        name: row.name,
        type: row.type as PaymentMethod['type'],

        status: row.status,

        createdAt: row.created_at,
    }
}