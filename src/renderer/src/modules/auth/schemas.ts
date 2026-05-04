import { z } from "zod"

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "E-mail é obrigatório.")
    .email("Informe um e-mail válido."),
  senha: z
    .string()
    .min(1, "Senha é obrigatória.")
    .min(6, "A senha deve ter pelo menos 6 caracteres."),
})

export const cadastroSchema = z
  .object({
    nome: z
      .string()
      .min(1, "Nome é obrigatório.")
      .min(2, "Nome deve ter pelo menos 2 caracteres.")
      .refine((v) => v.trim().split(/\s+/).length >= 2, {
        message: "Informe nome e sobrenome.",
      }),
    email: z
      .string()
      .min(1, "E-mail é obrigatório.")
      .email("Informe um e-mail válido."),
    senha: z
      .string()
      .min(1, "Senha é obrigatória.")
      .min(6, "A senha deve ter pelo menos 6 caracteres."),
    confirmarSenha: z.string().min(1, "Confirmação é obrigatória."),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    path: ["confirmarSenha"],
    message: "As senhas não coincidem.",
  })

export type LoginFormValues = z.infer<typeof loginSchema>
export type CadastroFormValues = z.infer<typeof cadastroSchema>
