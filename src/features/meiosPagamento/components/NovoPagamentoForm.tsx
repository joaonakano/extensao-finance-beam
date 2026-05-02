import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export function NovoPagamentoForm({
    userId,
    onSuccess
}: {
    userId: number,
    onSuccess?: () => void
}) {
    const [name, setName] = useState("")
    const [type, setType] = useState("outro")
    const [loading, setLoading] = useState(false)
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (!name.trim()) {
            alert("Nome obrigatorio")
            return
        }

        setLoading(true)

        const result = await window.api.paymentMethods.create({
            user_id: userId,
            name,
            type
        })

        setLoading(false)

        if(!result.success) {
            alert(result.error)
            return
        }

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
            
            <Select value={type} onValueChange={(v) => setType(v)}>
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