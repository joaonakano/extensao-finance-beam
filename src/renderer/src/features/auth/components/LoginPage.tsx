import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, Loader2, DollarSign } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

import { loginSchema, type LoginFormValues } from "../schemas"
import { useLogin, type AuthUser } from "../hooks/useAuth"

interface Props {
  onLogin: (user: AuthUser) => void
}

export function LoginPage({ onLogin }: Props) {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", senha: "" },
  })

  const { mutate: login, isPending } = useLogin((user) => {
    toast.success(`Bem-vindo, ${user.name}!`)
    onLogin(user)
    navigate("/gastos")
  })

  function onSubmit(data: LoginFormValues) {
    login(data, {
      onError: (err) => toast.error(err.message),
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <DollarSign className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Finance Beam</h1>
            <p className="text-sm text-muted-foreground">Entre na sua conta</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Acessar conta</CardTitle>
            <CardDescription>Informe suas credenciais para continuar.</CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
                {/* E-mail */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="seu@email.com"
                          autoComplete="email"
                          aria-invalid={!!form.formState.errors.email}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Senha */}
                <FormField
                  control={form.control}
                  name="senha"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            autoComplete="current-password"
                            className="pr-9"
                            aria-invalid={!!form.formState.errors.senha}
                            {...field}
                          />
                          <button
                            type="button"
                            tabIndex={-1}
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isPending} size="lg">
                  {isPending ? (
                    <><Loader2 className="size-4 animate-spin" />Entrando...</>
                  ) : "Entrar"}
                </Button>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex-col gap-4">
            <Separator />
            <p className="text-sm text-muted-foreground text-center">
              Não tem uma conta?{" "}
              <Link to="/cadastro" className="font-medium text-foreground underline-offset-4 hover:underline">
                Criar conta gratuita
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
