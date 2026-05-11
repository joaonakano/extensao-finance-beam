import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { UpdatePaymentMethod, updatePaymentMethodSchema, PaymentMethod } from "../schema"

type Props = {
  paymentMethod: PaymentMethod
  onSubmit: (data: UpdatePaymentMethod) => Promise<void>
}

export function EditarPagamentoForm({ paymentMethod, onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
  } = useForm<UpdatePaymentMethod>({
    resolver: zodResolver(updatePaymentMethodSchema),
    defaultValues: {
      id: paymentMethod.id,
      name: paymentMethod.name,
      type: paymentMethod.type,
      status: paymentMethod.status,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register("id", { valueAsNumber: true })} />

      <div className="space-y-1">
        <Label>Nome</Label>
        <Input {...register("name")} />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label>Tipo</Label>
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="space-y-1">
        <Label>Status</Label>
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <div className="flex items-center gap-2">
              <Switch
                checked={field.value === "ativo"}
                onCheckedChange={(checked) =>
                  field.onChange(checked ? "ativo" : "inativo")
                }
              />
              <span className="text-sm text-muted-foreground">
                {field.value === "ativo" ? "Ativo" : "Inativo"}
              </span>
            </div>
          )}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Salvando..." : "Salvar alterações"}
      </Button>
    </form>
  )
}