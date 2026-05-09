import { ExpenseStatus } from "../base/expense-status"

export interface CreateExpenseDTO {
    parentId?: number | null
    categoryId?: number | null
    paymentMethodId?: number | null

    description: string
    amount: number

    dueDate?: string | null

    isGroup?: 0 | 1

    notes?: string | null
}

export interface UpdateExpenseDTO {
    id: number

    categoryId?: number | null
    paymentMethodId?: number | null

    description?: string
    amount?: number

    dueDate?: string | null

    status?: ExpenseStatus

    notes?: string | null
}