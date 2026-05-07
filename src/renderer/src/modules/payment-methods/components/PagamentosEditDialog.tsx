import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EditarPagamentoForm } from "./EditarPagamentoForm"
import { PaymentMethod, UpdatePaymentMethod } from "../schema"

type Props = {
  paymentMethod: PaymentMethod | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: UpdatePaymentMethod) => Promise<void>
}

export function EditarPagamentoDialog({ paymentMethod, open, onOpenChange, onSubmit }: Props) {
  if (!paymentMethod) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Meio de Pagamento</DialogTitle>
        </DialogHeader>
        <EditarPagamentoForm paymentMethod={paymentMethod} onSubmit={onSubmit} />
      </DialogContent>
    </Dialog>
  )
}