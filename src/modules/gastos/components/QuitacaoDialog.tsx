import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, BadgeCheck, Clock } from "lucide-react"

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "@/components/ui/toaster"

import { quitacaoSchema, type QuitacaoFormValues } from "../schemas"
import { useCreateSettlement, useSettlements } from "../hooks/useSettlements"

interface Props {
  userId: number
  expense: any | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export function QuitacaoDialog({ userId, expense, open, onOpenChange }: Props) {
  const { settlements, isLoading: loadingSettlements } = useSettlements(expense?.id ?? null)
  const { mutate: createSettlement, isPending } = useCreateSettlement(userId)

  // Calcula quanto já foi pago via quitações
  const totalPago = settlements.reduce((sum: number, s: any) => sum + Number(s.amount_paid), 0)
  const totalOriginal = Number(expense?.total ?? 0)
  const totalRestante = Math.max(0, totalOriginal - totalPago)
  const isQuitado = totalRestante <= 0

  const form = useForm<QuitacaoFormValues>({
    resolver: zodResolver(quitacaoSchema),
    defaultValues: {
      payment_date: new Date().toISOString().split("T")[0],
      amount_paid: "",
    },
  })

  // Atualiza o campo amount_paid para sugerir o restante
  useEffect(() => {
    if (open && !isQuitado) {
      form.reset({
        payment_date: new Date().toISOString().split("T")[0],
        amount_paid: totalRestante > 0 ? totalRestante.toFixed(2) : "",
      })
    }
  }, [open, totalRestante, isQuitado])

  function onSubmit(data: QuitacaoFormValues) {
    const amountPaid = Number(data.amount_paid.replace(",", "."))

    if (amountPaid > totalRestante + 0.001) {
      form.setError("amount_paid", {
        message: `Valor não pode ser maior que o saldo restante (${fmt(totalRestante)}).`,
      })
      return
    }

    createSettlement(
      {
        expense_id: expense!.id,
        amount_paid: amountPaid,
        payment_date: data.payment_date,
      },
      {
        onSuccess: (res: any) => {
          if (!res?.success) {
            toast.error(res?.error ?? "Erro ao registrar quitação.")
            return
          }
          const isTotal = amountPaid >= totalRestante - 0.001
          toast.success(isTotal ? "Despesa quitada totalmente!" : "Pagamento parcial registrado!")
          form.reset({
            payment_date: new Date().toISOString().split("T")[0],
            amount_paid: "",
          })
          if (isTotal) onOpenChange(false)
        },
        onError: () => toast.error("Erro ao registrar quitação."),
      }
    )
  }

  if (!expense) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isQuitado
              ? <><BadgeCheck className="size-4 text-green-500" /> Despesa Quitada</>
              : <><Clock className="size-4 text-amber-500" /> Quite de Despesa</>}
          </DialogTitle>
          <DialogDescription className="truncate">
            {expense.description}
          </DialogDescription>
        </DialogHeader>

        {/* Resumo financeiro */}
        <div className="rounded-lg border bg-muted/40 p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Valor original</span>
            <span className="font-medium tabular-nums">{fmt(totalOriginal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total pago</span>
            <span className="font-medium tabular-nums text-green-600">{fmt(totalPago)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-base">
            <span className="font-semibold">Saldo restante</span>
            <span className={`font-bold tabular-nums ${isQuitado ? "text-green-600" : "text-destructive"}`}>
              {isQuitado ? <Badge className="bg-green-500 hover:bg-green-600">Quitado</Badge> : fmt(totalRestante)}
            </span>
          </div>
        </div>

        {/* Histórico de quitações */}
        {settlements.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Histórico de pagamentos
            </p>
            <div className="max-h-32 overflow-y-auto space-y-1 rounded-lg border divide-y text-sm">
              {loadingSettlements ? (
                <div className="flex justify-center py-3">
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                </div>
              ) : (
                settlements.map((s: any) => (
                  <div key={s.id} className="flex justify-between items-center px-3 py-2">
                    <span className="text-muted-foreground">
                      {new Date(s.payment_date).toLocaleDateString("pt-BR")}
                    </span>
                    <span className="font-medium tabular-nums text-green-600">
                      + {fmt(Number(s.amount_paid))}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Formulário — só exibe se ainda tem saldo */}
        {!isQuitado ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <Separator />

              <div className="grid grid-cols-2 gap-3">
                {/* Data do pagamento */}
                <FormField
                  control={form.control}
                  name="payment_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data do pagamento</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Valor a pagar */}
                <FormField
                  control={form.control}
                  name="amount_paid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor a pagar (R$)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={`Máx: ${fmt(totalRestante)}`}
                          inputMode="decimal"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Total restante (somente leitura) */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">
                  Restará após este pagamento
                </label>
                <div className="flex h-9 w-full items-center rounded-lg border bg-muted/50 px-3 text-sm tabular-nums text-muted-foreground select-none">
                  {(() => {
                    const v = form.watch("amount_paid")
                    const paid = Number(v.replace(",", ".")) || 0
                    const remaining = Math.max(0, totalRestante - paid)
                    return paid > 0 ? fmt(remaining) : fmt(totalRestante)
                  })()}
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending
                    ? <><Loader2 className="size-4 animate-spin" /> Registrando...</>
                    : "Registrar pagamento"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
