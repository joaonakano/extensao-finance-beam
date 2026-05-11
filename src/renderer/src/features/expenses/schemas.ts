import { z } from "zod"

export const gastoSchema = z.object({
  description: z
    .string()
    .min(1, "Descrição é obrigatória.")
    .min(2, "Descrição deve ter pelo menos 2 caracteres.")
    .max(150, "Descrição deve ter no máximo 150 caracteres."),
  amount: z
    .string()
    .min(1, "Valor é obrigatório.")
    .refine((v) => !isNaN(Number(v.replace(",", "."))) && Number(v.replace(",", ".")) > 0, {
      message: "Informe um valor válido maior que zero.",
    }),
  categoryId: z.string().min(1, "Categoria é obrigatória."),
  paymentMethodId: z.string().min(1, "Meio de pagamento é obrigatório."),
  dueDate: z.string().min(1, "Data é obrigatória."),
  isPaid: z.boolean(),
})

export type GastoFormValues = z.infer<typeof gastoSchema>

export const quitacaoSchema = z.object({
  paymentDate: z
    .string()
    .min(1, "Data de pagamento é obrigatória.")
    .refine((v) => !isNaN(Date.parse(v)), { message: "Data inválida." }),
  amountPaid: z
    .string()
    .min(1, "Valor a pagar é obrigatório.")
    .refine(
      (v) => !isNaN(Number(v.replace(",", "."))) && Number(v.replace(",", ".")) > 0,
      { message: "Informe um valor válido maior que zero." }
    ),
})

export type QuitacaoFormValues = z.infer<typeof quitacaoSchema>
