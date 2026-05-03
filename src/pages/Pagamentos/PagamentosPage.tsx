import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { TooltipProvider } from "@/components/ui/tooltip"
import { columns, PaymentMethod } from "./columns.tsx"
import { DataTable } from "./data-table"
import { usePaymentMethods } from "./hooks/usePaymentMethods.tsx"
import { NovoPagamentoForm } from "./components/NovoPagamentoForm.tsx"
import { PagamentoEditDialog } from "./components/PagamentosEditDialog.tsx"
import { PagamentoViewDialog } from "./components/PagamentosViewDialog.tsx"

export function PagamentosPage() {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<PaymentMethod | null>(null)
  const [mode, setMode] = useState<"view" | "edit" | null>(null)

  const userId = 1

  // hook para automatizar o processo de chamar o ipchandle
  const {
    data: pagamentos,
    remove,
    create
  } = usePaymentMethods(userId)

  async function handleCreate(data: { name: string, type: PaymentMethod["type"] }) {
    await create.mutateAsync({
      user_id: userId,
      ...data,
    })

    setOpen(false)
  }

  function handleView(payment: PaymentMethod) {
    setSelected(payment)
    setMode("view")
  }

  function handleEdit(payment: PaymentMethod) {
    setSelected(payment)
    setMode("edit")
  }

  function handleDelete(payment: PaymentMethod) {
    remove.mutate(payment.id)
  }

  function handleCloseDialogs() {
    setSelected(null)
    setMode(null)
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

          {/* CREATE */}
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
                userId={userId} 
                onSubmit={handleCreate}
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
        
        {/* VIEW */}
        <PagamentoViewDialog
          open={mode === "view"}
          paymentMethod={selected}
          onClose={handleCloseDialogs}
        />

        {/* EDIT */}
        <PagamentoEditDialog
          open={mode === "edit"}
          paymentMethod={selected}
          onClose={handleCloseDialogs}
        />

      </div>
    </TooltipProvider>
  )
}