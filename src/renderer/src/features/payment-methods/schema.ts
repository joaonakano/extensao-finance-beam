import z from "zod";

export const paymentMethodTypeEnum = z.enum([
    "pix",
    "cartao_credito",
    "cartao_debito",
    "dinheiro",
    "outro"
])

/*
export const paymentMethodStatusEnum = z.enum([
    "ativo",
    "inativo"
])
    */

export const createPaymentMethodSchema = z.object({
    user_id: z.number(),
    name: z.string().min(1, "Nome obrigatório"),
    type: paymentMethodTypeEnum,
})

export const updatePaymentMethodSchema = z.object({
    id: z.number(),
    name: z.string().min(1, "Nome obrigatório"),
    type: paymentMethodTypeEnum,
    status: z.enum(["ativo", "inativo"]),
})

export const paymentMethodSchema = z.object({
    id: z.number(),
    user_id: z.number(),
    name: z.string().min(1, "Nome obrigatório"),
    type: paymentMethodTypeEnum,
    status: z.enum(["ativo", "inativo"]),
})

export type PaymentMethod = z.infer<typeof paymentMethodSchema>
export type CreatePaymentMethod = z.infer<typeof createPaymentMethodSchema>
export type UpdatePaymentMethod = z.infer<typeof updatePaymentMethodSchema>