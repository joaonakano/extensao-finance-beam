import { PaymentMethodType } from "../base/payment-method-type"


export interface PaymentMethod {
    id: number
    userId: number

    name: string
    type: PaymentMethodType

    status: 'ativo' | 'inativo'

    createdAt: string
}