import { useMutation } from "@tanstack/react-query"
import { handleApi } from "@/services/api"
import type { AuthUser } from "../context"
import type { LoginFormValues, CadastroFormValues } from "../schemas"

/*
  RESPONSABILIDADES DO USEAUTH
    -> OBTER USUÁRIO ATUAL
    -> EXPOR LOADING
    -> EXPOR AUTHENTICATED
    -> EXPOR LOGOUT
    -> MANTER CACHE
*/

export type { AuthUser }

export function useLogin(onSuccess: (user: AuthUser) => void) {
  return useMutation({
    mutationFn: async (data: LoginFormValues) => {
      // Novo backend: { email, password }
      const user = await handleApi(
        window.api.auth.login({ email: data.email, password: data.senha })
      )
      return user as AuthUser
    },
    onSuccess,
  })
}

export function useRegister(onSuccess: () => void) {
  return useMutation({
    mutationFn: async (data: CadastroFormValues) => {
      // Novo backend: { name, email, password }
      await handleApi(
        window.api.auth.register({ name: data.nome, email: data.email, password: data.senha })
      )
    },
    onSuccess,
  })
}
