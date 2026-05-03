import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PaymentMethod } from "../columns"
import { EditarPagamentoForm } from "./EditarPagamentoForm.tsx"


type Props = {
    open: boolean
    onClose: () => void
    paymentMethod: PaymentMethod | null
}

export function PagamentoEditDialog({
    open,
    onClose,
    paymentMethod
}: Props) {
    if (!paymentMethod) return null

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Meio de Pagamento</DialogTitle>
                </DialogHeader>

                <EditarPagamentoForm
                    paymentMethod={paymentMethod}
                    onSuccess={onClose}
                />
            </DialogContent>
        </Dialog>
    )
}