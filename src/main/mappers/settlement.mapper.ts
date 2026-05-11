import { Settlement } from "@shared/types"

interface SettlementRow {
    id: number
    user_id: number
    expense_id: number

    amount_paid: number
    payment_date: string

    notes: string | null

    created_at: string
}

export function mapSettlement(row: SettlementRow): Settlement {
    return {
        id: row.id,
        userId: row.user_id,
        expenseId: row.expense_id,

        amountPaid: row.amount_paid,
        paymentDate: row.payment_date,

        notes: row.notes,

        createdAt: row.created_at,
    }
}