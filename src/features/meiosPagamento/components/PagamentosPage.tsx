import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { NovoPagamentoForm } from "./NovoPagamentoForm"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { TooltipProvider } from "@/components/ui/tooltip"
import { columns, PaymentMethod, paymentMethodSchema } from "./columns.tsx"
import { DataTable } from "./data-table"
import { usePaymentMethods } from "../hooks/usePaymentMethods.tsx"

export function PagamentosPage() {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<PaymentMethod | null>(null)
  const [mode, setMode] = useState<"view" | "edit" | null>(null)

  const queryClient = useQueryClient()

  // hook para automatizar o processo de chamar o ipchandle
  const {
    data: pagamentos,
    remove,
  } = usePaymentMethods()

  function handleView(payment: PaymentMethod) {
    setSelected(payment)
    setMode("view")
    console.log("VISUALIZANDO")
  }

  function handleEdit(payment: PaymentMethod) {
    setSelected(payment)
    setMode("edit")
    console.log("EDITANDO")
  }

  function handleDelete(payment: PaymentMethod) {
    remove(payment.id)
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
        <div className="container mx-auto py-10">
          <DataTable
            columns={columns}
            data={pagamentos ?? []}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            />
        </div>
        
      </div>
    </TooltipProvider>
  )
}