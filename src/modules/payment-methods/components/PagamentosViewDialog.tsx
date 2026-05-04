import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { PaymentMethod } from "../schema"

export const paymentMethodFormat: Record<PaymentMethod["type"], string> = {
  pix: "PIX",
  cartao_credito: "Cartão de Crédito",
  cartao_debito: "Cartão de Débito",
  dinheiro: "Dinheiro",
  outro: "Outro",
}

type Props = {
  paymentMethod: PaymentMethod | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewPagamentoDialog({ paymentMethod, open, onOpenChange }: Props) {
  if (!paymentMethod) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Meio de Pagamento</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nome</span>
            <span className="font-medium">{paymentMethod.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tipo</span>
            <span className="font-medium">{paymentMethodFormat[paymentMethod.type]}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Status</span>
            <Badge
              className={
                paymentMethod.status === "ativo"
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-red-500 hover:bg-red-600 text-white"
              }
            >
              {paymentMethod.status === "ativo" ? "Ativo" : "Inativo"}
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}