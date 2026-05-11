import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { gastoSchema, type GastoFormValues } from "../schemas"
import { useCreateExpense } from "../hooks/useExpenses"
import { useCategories, usePaymentMethods } from "../hooks/useSupport"
import type { Expense } from "@/env"

interface Props {
  userId: number
  parentExpense: Expense
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NovoGastoFilhoDialog({ userId, parentExpense, open, onOpenChange }: Props) {
  const { categories } = useCategories()
  const { paymentMethods } = usePaymentMethods()
  const { mutate: createExpense, isPending } = useCreateExpense(userId)

  const form = useForm<GastoFormValues>({
    resolver: zodResolver(gastoSchema),
    defaultValues: {
      description: "",
      amount: "",
      categoryId: parentExpense.categoryId ? String(parentExpense.categoryId) : "",
      paymentMethodId: parentExpense.paymentMethodId ? String(parentExpense.paymentMethodId) : "",
      dueDate: new Date().toISOString().split("T")[0],
      isPaid: false,
    },
  })

  function onSubmit(data: GastoFormValues) {
    createExpense({ ...data, parentId: parentExpense.id }, {
      onSuccess: () => { toast.success("Sub-gasto adicionado!"); form.reset(); onOpenChange(false) },
      onError: (err) => toast.error(err.message),
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) form.reset(); onOpenChange(v) }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Sub-gasto</DialogTitle>
          <DialogDescription>
            Vinculado a: <span className="font-medium text-foreground">{parentExpense.description}</span>
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Descrição</FormLabel><FormControl>
                <Input placeholder="Ex: Pizza, Camiseta..." maxLength={150} autoFocus {...field} />
              </FormControl><FormMessage /></FormItem>
            )} />

            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="amount" render={({ field }) => (
                <FormItem><FormLabel>Valor (R$)</FormLabel><FormControl>
                  <Input placeholder="0,00" inputMode="decimal" {...field} />
                </FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="dueDate" render={({ field }) => (
                <FormItem><FormLabel>Data</FormLabel><FormControl>
                  <Input type="date" {...field} />
                </FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <FormField control={form.control} name="categoryId" render={({ field }) => (
              <FormItem><FormLabel>Categoria</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        <span style={{ color: c.color }}>●</span> {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select><FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="paymentMethodId" render={({ field }) => (
              <FormItem><FormLabel>Meio de Pagamento</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                  <SelectContent>
                    {paymentMethods.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select><FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="isPaid" render={({ field }) => (
              <FormItem className="flex-row items-center gap-2 space-y-0">
                <FormControl>
                  <input type="checkbox" id="childIsPaid" checked={field.value} onChange={field.onChange}
                    className="size-4 rounded border-input accent-primary cursor-pointer" />
                </FormControl>
                <FormLabel htmlFor="childIsPaid" className="cursor-pointer font-normal">Marcar como pago</FormLabel>
              </FormItem>
            )} />

            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)} disabled={isPending}>Cancelar</Button>
              <Button type="submit" className="flex-1" disabled={isPending}>
                {isPending ? <><Loader2 className="size-4 animate-spin" /> Salvando...</> : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
