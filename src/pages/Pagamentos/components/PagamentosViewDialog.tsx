import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PaymentMethod } from "../columns"

type Props = {
    open: boolean
    onClose: () => void
    paymentMethod: PaymentMethod | null
}

export function PagamentoViewDialog({ open, onClose, paymentMethod }: Props) {
    if (!paymentMethod) return null

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Detalhes</DialogTitle>
                </DialogHeader>

                <div className="space-y-2">
                    <p><strong>Nome:</strong> {paymentMethod.name}</p>
                    <p><strong>Tipo:</strong> {paymentMethod.type}</p>
                </div>
            </DialogContent>
        </Dialog>
    )
}