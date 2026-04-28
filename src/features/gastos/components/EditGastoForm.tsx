import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/toaster"

import { gastoSchema, type GastoFormValues } from "../schemas"
import { useUpdateExpense } from "../hooks/useExpenses"
import { useCategories, usePaymentMethods } from "../hooks/useSupport"

interface Props {
  userId: number
  expense: any
  onClose: () => void
}

export function EditGastoForm({ userId, expense, onClose }: Props) {
  const { categories } = useCategories(userId)
  const { paymentMethods } = usePaymentMethods(userId)
  const { mutate: updateExpense, isPending } = useUpdateExpense(userId)

  const form = useForm<GastoFormValues>({
    resolver: zodResolver(gastoSchema),
    defaultValues: {
      description: "",
      total: "",
      category_id: "",
      payment_method_id: "",
      date: new Date().toISOString().split("T")[0],
      is_paid: false,
      is_recurring: false,
    },
  })

  useEffect(() => {
    if (expense) {
      form.reset({
        description: expense.description ?? "",
        total: String(expense.total ?? ""),
        category_id: expense.category_id ? String(expense.category_id) : "",
        payment_method_id: expense.payment_method_id ? String(expense.payment_method_id) : "",
        date: expense.date ?? new Date().toISOString().split("T")[0],
        is_paid: Boolean(expense.is_paid),
        is_recurring: Boolean(expense.is_recurring),
      })
    }
  }, [expense])

  function onSubmit(data: GastoFormValues) {
    updateExpense(
      {
        id: expense.id,
        description: data.description,
        total: Number(data.total.replace(",", ".")),
        category_id: Number(data.category_id),
        payment_method_id: Number(data.payment_method_id),
        date: data.date,
        is_paid: data.is_paid ? 1 : 0,
        is_recurring: data.is_recurring ? 1 : 0,
      },
      {
        onSuccess: () => { toast.success("Gasto atualizado com sucesso!"); onClose() },
        onError: (err) => toast.error(err.message),
      }
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField control={form.control} name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Conta de luz, Supermercado..." maxLength={150} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="total"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor (R$)</FormLabel>
                <FormControl>
                  <Input placeholder="0,00" inputMode="decimal" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField control={form.control} name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField control={form.control} name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Selecione uma categoria..." /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((cat: any) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      <span style={{ color: cat.color }}>●</span> {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField control={form.control} name="payment_method_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meio de Pagamento</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Selecione o meio de pagamento..." /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {paymentMethods.map((pm: any) => (
                    <SelectItem key={pm.id} value={String(pm.id)}>{pm.name ?? pm.descricao}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <FormField control={form.control} name="is_paid"
            render={({ field }) => (
              <FormItem className="flex-row items-center gap-2 space-y-0">
                <FormControl>
                  <input type="checkbox" id="edit_is_paid" checked={field.value} onChange={field.onChange}
                    className="size-4 rounded border-input accent-primary cursor-pointer" />
                </FormControl>
                <FormLabel htmlFor="edit_is_paid" className="cursor-pointer font-normal">Pago</FormLabel>
              </FormItem>
            )}
          />
          <FormField control={form.control} name="is_recurring"
            render={({ field }) => (
              <FormItem className="flex-row items-center gap-2 space-y-0">
                <FormControl>
                  <input type="checkbox" id="edit_is_recurring" checked={field.value} onChange={field.onChange}
                    className="size-4 rounded border-input accent-primary cursor-pointer" />
                </FormControl>
                <FormLabel htmlFor="edit_is_recurring" className="cursor-pointer font-normal">Recorrente</FormLabel>
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="submit" className="flex-1" disabled={isPending}>
            {isPending ? <><Loader2 className="size-4 animate-spin" /> Salvando...</> : "Salvar alterações"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
