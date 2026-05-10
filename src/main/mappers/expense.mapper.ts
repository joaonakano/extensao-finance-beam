import { Expense } from "@shared/types"

interface ExpenseRow {
    id: number
    user_id: number

    parent_id: number | null
    category_id: number | null
    payment_method_id: number | null

    description: string
    amount: number

    due_date: string | null
    status: string

    is_group: 0 | 1

    recurrence_group_id: number | null

    installment_group_id: number | null
    installment_number: number | null
    installment_total: number | null

    notes: string | null

    created_at: string
}

export function mapExpense(row: ExpenseRow): Expense {
    return {
        id: row.id,

        userId: row.user_id,

        parentId: row.parent_id,
        categoryId: row.category_id,
        paymentMethodId: row.payment_method_id,

        description: row.description,
        amount: row.amount,

        dueDate: row.due_date,
        status: row.status as Expense['status'],

        isGroup: row.is_group,

        recurrenceGroupId: row.recurrence_group_id,

        installmentGroupId: row.installment_group_id,
        installmentNumber: row.installment_number,
        installmentTotal: row.installment_total,

        notes: row.notes,

        createdAt: row.created_at,
    }
}