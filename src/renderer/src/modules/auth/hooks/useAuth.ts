import { useMutation } from "@tanstack/react-query"
import type { LoginFormValues, CadastroFormValues } from "../schemas"

export interface AuthUser {
  id: number
  nome: string
  email: string
}

export function useLogin(onSuccess: (user: AuthUser) => void) {
  return useMutation({
    mutationFn: async (data: LoginFormValues) => {
      const result = await window.api.auth.login(data.email, data.senha)
      if (!result?.success) throw new Error(result?.error ?? "E-mail ou senha incorretos.")
      return result.data as AuthUser
    },
    onSuccess,
  })
}

export function useRegister(onSuccess: () => void) {
  return useMutation({
    mutationFn: async (data: CadastroFormValues) => {
      // Verifica e-mail duplicado primeiro
      const check = await window.api.auth.checkEmail(data.email)
      if (check?.exists) throw new Error("Este e-mail já está cadastrado.")
      const result = await window.api.auth.register(data.nome, data.email, data.senha)
      if (!result?.success) throw new Error(result?.error ?? "Erro ao criar conta.")
      return result
    },
    onSuccess,
  })
}
