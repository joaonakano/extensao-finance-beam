import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

import { gastoSchema, type GastoFormValues } from "../schemas"
import { useCreateExpense } from "../hooks/useExpenses"
import { useCategories, usePaymentMethods } from "../hooks/useSupport"

interface Props {
  userId: number
  onClose: () => void
}

export function NovoGastoForm({ userId, onClose }: Props) {
  const { categories } = useCategories(userId)
  const { paymentMethods } = usePaymentMethods(userId)
  const { mutate: createExpense, isPending } = useCreateExpense(userId)

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

  function onSubmit(data: GastoFormValues) {
    createExpense(data, {
      onSuccess: () => {
        toast.success("Gasto registrado com sucesso!")
        onClose()
      },
      onError: (err) => toast.error(err.message),
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>

        {/* Descrição */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Conta de luz, Supermercado..."
                  maxLength={150}
                  aria-invalid={!!form.formState.errors.description}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Valor + Data */}
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="total"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor (R$)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="0,00"
                    inputMode="decimal"
                    aria-invalid={!!form.formState.errors.total}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    aria-invalid={!!form.formState.errors.date}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Categoria */}
        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger aria-invalid={!!form.formState.errors.category_id}>
                    <SelectValue placeholder="Selecione uma categoria..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((cat: any) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      <span style={{ color: cat.color }}>●</span>
                      {" "}{cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Meio de pagamento */}
        <FormField
          control={form.control}
          name="payment_method_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meio de Pagamento</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger aria-invalid={!!form.formState.errors.payment_method_id}>
                    <SelectValue placeholder="Selecione o meio de pagamento..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {paymentMethods.map((pm: any) => (
                    <SelectItem key={pm.id} value={String(pm.id)}>
                      {pm.name ?? pm.descricao}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Checkboxes: Pago + Recorrente */}
        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="is_paid"
            render={({ field }) => (
              <FormItem className="flex-row items-center gap-2 space-y-0">
                <FormControl>
                  <input
                    type="checkbox"
                    id="is_paid"
                    checked={field.value}
                    onChange={field.onChange}
                    className="size-4 rounded border-input accent-primary cursor-pointer"
                  />
                </FormControl>
                <FormLabel htmlFor="is_paid" className="cursor-pointer font-normal">Pago</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="is_recurring"
            render={({ field }) => (
              <FormItem className="flex-row items-center gap-2 space-y-0">
                <FormControl>
                  <input
                    type="checkbox"
                    id="is_recurring"
                    checked={field.value}
                    onChange={field.onChange}
                    className="size-4 rounded border-input accent-primary cursor-pointer"
                  />
                </FormControl>
                <FormLabel htmlFor="is_recurring" className="cursor-pointer font-normal">Recorrente</FormLabel>
              </FormItem>
            )}
          />
        </div>

        {/* Ações */}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="submit" className="flex-1" disabled={isPending}>
            {isPending ? <><Loader2 className="size-4 animate-spin" /> Salvando...</> : "Salvar"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
