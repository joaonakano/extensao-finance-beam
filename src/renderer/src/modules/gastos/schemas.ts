import { z } from "zod"

export const gastoSchema = z.object({
  description: z
    .string()
    .min(1, "Descrição é obrigatória.")
    .min(2, "Descrição deve ter pelo menos 2 caracteres.")
    .max(150, "Descrição deve ter no máximo 150 caracteres."),
  total: z
    .string()
    .min(1, "Valor é obrigatório.")
    .refine((v) => !isNaN(Number(v.replace(",", "."))) && Number(v.replace(",", ".")) > 0, {
      message: "Informe um valor válido maior que zero.",
    }),
  category_id: z.string().min(1, "Categoria é obrigatória."),
  payment_method_id: z.string().min(1, "Meio de pagamento é obrigatório."),
  date: z.string().min(1, "Data é obrigatória."),
  is_paid: z.boolean(),
  is_recurring: z.boolean(),
})

export type GastoFormValues = z.infer<typeof gastoSchema>

// Schema para quitação parcial/total
export const quitacaoSchema = z.object({
  payment_date: z
    .string()
    .min(1, "Data de pagamento é obrigatória.")
    .refine((v) => !isNaN(Date.parse(v)), { message: "Data inválida." }),
  amount_paid: z
    .string()
    .min(1, "Valor a pagar é obrigatório.")
    .refine(
      (v) => !isNaN(Number(v.replace(",", "."))) && Number(v.replace(",", ".")) > 0,
      { message: "Informe um valor válido maior que zero." }
    ),
})

export type QuitacaoFormValues = z.infer<typeof quitacaoSchema>
