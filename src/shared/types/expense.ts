export interface Expense {
    id: number,
    user_id: number,
    description: string,
    amount: number,
    category_id: number,
    payment_method_id: number,
    date: string,
    is_paid: number,
    is_recurring: number,
    parent_id: number,
}