export interface Settlement {
    id: number
    userId: number
    expenseId: number

    amountPaid: number
    paymentDate: string

    notes?: string | null

    createdAt: string
}