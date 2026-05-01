import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { NovoPagamentoForm } from "./NovoPagamentoForm"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { TooltipProvider } from "@/components/ui/tooltip"

export function PagamentosPage() {
  const [open, setOpen] = useState(false)

  // react query para automatizar o processo de chamar o ipchandle
  const { data: pagamentos } = useQuery({
    queryKey: ["payment-methods"],
    queryFn: () => window.api.paymentMethods.getAll(1)
  })
  const queryClient = useQueryClient()

  async function handleDelete(id: number) {
    const confirmed = confirm("Deseja excluir este meio de pagamento?")
    if (!confirmed) return

    const result = await window.api.paymentMethods.delete(id)

    if (!result.success) {
      alert(result.error)
      return
    }

    queryClient.invalidateQueries({ queryKey: ["payment-methods"] })
  }

  function formatType(type: string) {
    switch (type) {
      case "dinheiro": return "Dinheiro"
      case "pix": return "PIX"
      case "cartao_credito": return "Cartão de Crédito"
      case "cartao_debito": return "Cartão de Débito"
      default: return "Outro"
    }
  }

  return (
    <TooltipProvider>
      <div className="p-6 max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Meios de Pagamento</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Gerencie seus métodos de pagamento.
            </p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4 mr-1" />
                Novo
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Meio de Pagamento</DialogTitle>
              </DialogHeader>

              <NovoPagamentoForm
                userId={1} 
                onSuccess={() =>  {
                  setOpen(false)
                  queryClient.invalidateQueries({ queryKey: ["payment-methods"] })
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Tabela */}
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
   
            <TableBody>
              {!pagamentos || pagamentos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                    Nenhum meio de pagamento cadastrado. Clique em "Novo" para começar.
                  </TableCell>
                </TableRow>
              ) : (
                pagamentos.map((p: any) => (
                  <TableRow key={p.id} className="hover:bg-muted/40">
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {formatType(p.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {p.status === "ativo"
                        ? <Badge className="bg-green-500 hover:bg-green-600">Ativo</Badge>
                        : <Badge variant="destructive">Inativo</Badge>}
                    </TableCell>
                    <TableCell className="text-center">
                        <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(p.id)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="size-4"></Trash2>
                        </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
        </Table>
        </div>
      </div>
    </TooltipProvider>
  )
}