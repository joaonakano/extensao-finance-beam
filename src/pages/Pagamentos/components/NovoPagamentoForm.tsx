import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { PaymentMethod } from "../columns";

type FormData = {
    name: string
    type: PaymentMethod["type"]
}

type Props = {
    userId: number
    onSubmit: (data: FormData) => Promise<void> | void
    loading?: boolean
    onSuccess?: () => void
}

export function NovoPagamentoForm({
    userId,
    onSubmit,
    loading = false,
    onSuccess,
}: Props) {
    const [name, setName] = useState("")
    const [type, setType] = useState<PaymentMethod["type"]>("outro")

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (!name.trim()) {
            alert("Nome obrigatorio")
            return
        }

        await onSubmit({
            name,
            type
        })

        setName("")
        setType("outro")

        onSuccess?.()
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                placeholder="EX: Nubank, Carteira"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            
            <Select value={type} onValueChange={(v) => setType(v as PaymentMethod["type"])}>
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

            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Salvando..." : "Salvar"}
            </Button>
        </form>
    )
}