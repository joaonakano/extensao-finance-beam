import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreatePaymentMethod, createPaymentMethodSchema } from "../schema"
import { useEffect } from "react"

type Props = {
  userId: number
  onSubmit: (data: CreatePaymentMethod) => Promise<void>
}

export function NovoPagamentoForm({ userId, onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm<CreatePaymentMethod>({
    resolver: zodResolver(createPaymentMethodSchema),
    defaultValues: {
      user_id: userId,
      name: "",
      type: "outro",
    },
  })

  useEffect(() => {
    setValue("user_id", userId)
  }, [userId, setValue])

  // console.log("ERRORS:", errors)
  // console.log("USER_ID DEFAULT:", userId)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      
 <div className="space-y-1">
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <Input
              placeholder="Ex: Dinheiro, Boleto, Cartão"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

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

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Salvando..." : "Salvar"}
      </Button>
    </form>
  )
}