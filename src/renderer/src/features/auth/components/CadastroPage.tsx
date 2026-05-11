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
import { cn } from "@/lib/utils"

import { cadastroSchema, type CadastroFormValues } from "../schemas"
import { useRegister } from "../hooks/useAuth"

function getPasswordStrength(password: string) {
  if (!password) return { score: 0, label: "", color: "" }
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 1) return { score: 1, label: "Fraca", color: "bg-destructive" }
  if (score === 2) return { score: 2, label: "Média", color: "bg-yellow-400" }
  if (score === 3) return { score: 3, label: "Boa", color: "bg-blue-500" }
  return { score: 4, label: "Forte", color: "bg-green-500" }
}

export function CadastroPage() {
  const navigate = useNavigate()
  const [showSenha, setShowSenha] = useState(false)
  const [showConfirmar, setShowConfirmar] = useState(false)

  const form = useForm<CadastroFormValues>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: { nome: "", email: "", senha: "", confirmarSenha: "" },
  })

  const senhaValue = form.watch("senha")
  const strength = getPasswordStrength(senhaValue)

  const { mutate: register, isPending } = useRegister(() => {
    toast.success("Conta criada com sucesso! Faça login para continuar.")
    navigate("/login")
  })

  function onSubmit(data: CadastroFormValues) {
    register(data, {
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
            <p className="text-sm text-muted-foreground">Crie sua conta gratuita</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Criar conta</CardTitle>
            <CardDescription>Preencha os dados abaixo para começar.</CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>

                {/* Nome */}
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome completo</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="João da Silva"
                          autoComplete="name"
                          aria-invalid={!!form.formState.errors.nome}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                            type={showSenha ? "text" : "password"}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            className="pr-9"
                            aria-invalid={!!form.formState.errors.senha}
                            {...field}
                          />
                          <button
                            type="button"
                            tabIndex={-1}
                            onClick={() => setShowSenha((v) => !v)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showSenha ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          </button>
                        </div>
                      </FormControl>

                      {/* Indicador de força */}
                      {senhaValue && (
                        <div className="space-y-1 pt-0.5">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4].map((i) => (
                              <div
                                key={i}
                                className={cn(
                                  "h-1 flex-1 rounded-full transition-all duration-300",
                                  i <= strength.score ? strength.color : "bg-border"
                                )}
                              />
                            ))}
                          </div>
                          <p className={cn(
                            "text-xs font-medium",
                            strength.score === 1 && "text-destructive",
                            strength.score === 2 && "text-yellow-500",
                            strength.score === 3 && "text-blue-500",
                            strength.score === 4 && "text-green-500",
                          )}>
                            Senha {strength.label}
                          </p>
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Confirmar senha */}
                <FormField
                  control={form.control}
                  name="confirmarSenha"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmar ? "text" : "password"}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            className="pr-9"
                            aria-invalid={!!form.formState.errors.confirmarSenha}
                            {...field}
                          />
                          <button
                            type="button"
                            tabIndex={-1}
                            onClick={() => setShowConfirmar((v) => !v)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showConfirmar ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isPending} size="lg">
                  {isPending ? (
                    <><Loader2 className="size-4 animate-spin" />Criando conta...</>
                  ) : "Criar conta"}
                </Button>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex-col gap-4">
            <Separator />
            <p className="text-sm text-muted-foreground text-center">
              Já tem uma conta?{" "}
              <Link to="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
                Entrar
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
