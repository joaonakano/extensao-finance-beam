export interface CreateSettlementDTO {
    expenseId: number
    amountPaid: number
    paymentDate: string
    notes?: string | null
}