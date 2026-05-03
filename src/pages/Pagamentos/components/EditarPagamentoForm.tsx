import { useState } from "react";
import { PaymentMethod } from "../columns";
import { usePaymentMethods } from "../hooks/usePaymentMethods";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function EditarPagamentoForm({
    paymentMethod,
    onSuccess
}: {
    paymentMethod: PaymentMethod
    onSuccess?: () => void
}) {
    const [name, setName] = useState(paymentMethod.name)
    const [type, setType] = useState(paymentMethod.type)
    const [status, setStatus] = useState(paymentMethod.status)

    const { update } = usePaymentMethods(paymentMethod.user_id)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (!name.trim()) {
            alert("Nome obrigatório")
            return
        }

        try {
            await update.mutateAsync({
                id: paymentMethod.id,
                name,
                type,
                status
            })

            onSuccess?.()
        } catch (err: any) {
            alert(err.message)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            <Select
                value={type}
                onValueChange={(value) => 
                    setType(value as typeof type)
                }
            >
                <SelectTrigger>
                    <SelectValue />
                </SelectTrigger>
                
                <SelectContent>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                    <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
            </Select>

            <Select
                value={status}
                onValueChange={(value) => 
                    setStatus(value as typeof status)
                }
            >
                <SelectTrigger>
                <SelectValue />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
            </Select>

            <Button
                type="submit"
                className="w-full"
                disabled={update.isPending}
            >
                {update.isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
        </form>
    )
}