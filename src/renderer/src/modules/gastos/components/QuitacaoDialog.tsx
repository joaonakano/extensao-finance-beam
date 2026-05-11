import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"
import { quitacaoSchema, type QuitacaoFormValues } from "../schemas"
import { useCreateSettlement } from "../hooks/useSettlements"
import type { Expense } from "@/env"

interface Props {
  userId: number
  expense: Expense | null
  open: boolean
  onOpenChange: (open: boolean) => void
  parentId?: number | null
}

export function QuitacaoDialog({ userId, expense, open, onOpenChange, parentId }: Props) {
  const { mutate: createSettlement, isPending } = useCreateSettlement(userId)

  const form = useForm<QuitacaoFormValues>({
    resolver: zodResolver(quitacaoSchema),
    defaultValues: { paymentDate: new Date().toISOString().split("T")[0], amountPaid: "" },
  })

  function onSubmit(data: QuitacaoFormValues) {
    if (!expense) return
    createSettlement({
      expenseId: expense.id,
      amountPaid: Number(data.amountPaid.replace(",", ".")),
      paymentDate: data.paymentDate,
      parentId: parentId ?? null,
    }, {
      onSuccess: () => { toast.success("Quitação registrada!"); form.reset(); onOpenChange(false) },
      onError: (err) => toast.error(err.message),
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) form.reset(); onOpenChange(v) }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Registrar Quite</DialogTitle>
          <DialogDescription>
            Gasto: <span className="font-medium text-foreground">{expense?.description}</span>
            <br />
            Valor: <span className="font-medium text-foreground">
              R$ {Number(expense?.amount ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField control={form.control} name="amountPaid" render={({ field }) => (
              <FormItem><FormLabel>Valor pago (R$)</FormLabel><FormControl>
                <Input placeholder="0,00" inputMode="decimal" autoFocus {...field} />
              </FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="paymentDate" render={({ field }) => (
              <FormItem><FormLabel>Data do pagamento</FormLabel><FormControl>
                <Input type="date" {...field} />
              </FormControl><FormMessage /></FormItem>
            )} />
            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)} disabled={isPending}>Cancelar</Button>
              <Button type="submit" className="flex-1" disabled={isPending}>
                {isPending ? <><Loader2 className="size-4 animate-spin" /> Salvando...</> : "Confirmar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
