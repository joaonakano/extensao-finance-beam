export type PaymentMethodType =
    | "pix"
    | "dinheiro"
    | "cartao_credito"
    | "cartao_debito"
    | "outros"

export type PaymentMethodStatus =
    | "ativo"
    | "inativo"

export interface PaymentMethod {
    id: number,
    user_id: number,
    name: string,
    type: PaymentMethodType,
    status: PaymentMethodStatus,
}