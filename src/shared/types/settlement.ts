export interface Settlement {
    id: number,
    expense_id: number,
    amount_paid: number,
    payment_date: string
}

export type CreateSettlementInput = Omit<Settlement, 'id'>