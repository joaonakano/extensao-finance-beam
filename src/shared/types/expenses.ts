export interface Expense {
    id: number
    user_id: number
    parent_id: number | null
    category_id: number | null
    payment_method_id: number | null
    description: string
    amount: number
    date: string
    is_paid: number
    is_recurring: number
    created_at?: string
}

export interface SubExpenseView extends Expense {
    category_name: string | null
    category_color: string | null
    payment_method_name: string | null
    amount_paid: number
    remaining_amount: number
}