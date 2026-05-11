export interface CreateSettlementDTO {
    expenseId: number

    amountPaid: number

    paymentDate: string

    notes?: string | null
}

export interface UpdateSettlementDTO {
    amountPaid?: number

    paymentDate?: string

    notes?: string | null
}