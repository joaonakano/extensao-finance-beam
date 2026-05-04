import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { TooltipProvider } from "@/components/ui/tooltip"
import { usePaymentMethods } from "../hooks/usePaymentMethods"
import { NovoPagamentoForm } from "../components/NovoPagamentoForm"
import { DataTable } from "../data-table"
import { columns } from "../columns"
import { PaymentMethod, UpdatePaymentMethod } from "../schema"
import { ViewPagamentoDialog } from "../components/PagamentosViewDialog"
import { EditarPagamentoDialog } from "../components/PagamentosEditDialog"

export function PagamentosPage() {
  const userId = 1

  const { data: pagamentos, create, update, remove } = usePaymentMethods(userId)

  console.log("[page] status completo:", { pagamentos })
  
  const [createOpen, setCreateOpen] = useState(false)
  const [viewTarget, setViewTarget] = useState<PaymentMethod | null>(null)
  const [editTarget, setEditTarget] = useState<PaymentMethod | null>(null)

  async function handleCreate(data: any) {
    await create.mutateAsync(data)
    setCreateOpen(false)
  }

  async function handleUpdate(data: UpdatePaymentMethod) {
    await update.mutateAsync(data)
    setEditTarget(null)
  }

  async function handleDelete(pm: PaymentMethod) {
    await remove.mutateAsync(pm.id)
  }

  console.log("[PagamentosPage] pagamentos:", pagamentos)

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
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
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
              <NovoPagamentoForm userId={userId} onSubmit={handleCreate} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabela */}
        <div className="container mx-auto py-10">
          <DataTable
            columns={columns}
            data={pagamentos ?? []}
            meta={{
              onView: (pm) => setViewTarget(pm as PaymentMethod),
              onEdit: (pm) => setEditTarget(pm as PaymentMethod),
              onDelete: (pm) => handleDelete(pm as PaymentMethod),
            }}
          />
        </div>
      </div>

      {/* VIEW */}
      <ViewPagamentoDialog
        paymentMethod={viewTarget}
        open={!!viewTarget}
        onOpenChange={(open: boolean) => { if (!open) setViewTarget(null) }}
      />

      {/* EDIT */}
      <EditarPagamentoDialog
        paymentMethod={editTarget}
        open={!!editTarget}
        onOpenChange={(open: boolean) => { if (!open) setEditTarget(null) }}
        onSubmit={handleUpdate}
      />
    </TooltipProvider>
  )
}