import { ExpenseStatus } from "../base/expense-status"

export interface Expense {
    id: number
    userId: number

    parentId: number | null

    categoryId: number | null
    paymentMethodId: number | null

    description: string

    amount: number

    dueDate: string | null

    status: ExpenseStatus

    is_group: 0 | 1

    recurrenceGroupId: number | null

    installmentGroupId: number | null
    installmentNumber: number | null
    installmentTotal: number | null

    notes: string | null

    createdAt: string
}