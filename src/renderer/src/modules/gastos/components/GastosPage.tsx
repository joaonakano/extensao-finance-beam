import { useState } from "react"
import { Plus, CheckCircle2, Circle, Loader2, ChevronDown, ChevronRight } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useExpenses, useDeleteExpense, useTogglePaid } from "../hooks/useExpenses"
import { NovoGastoForm } from "./NovoGastoForm"
import { EditGastoForm } from "./EditGastoForm"
import { QuitacaoDialog } from "./QuitacaoDialog"
import { NovoGastoFilhoDialog } from "./NovoGastoFilhoDialog"
import { SubGastosRows } from "./SubGastosRows"
import { GastoActionsMenu } from "./GastoActionsMenu"
import type { Expense } from "@/env"

interface Props { userId: number }

export function GastosPage({ userId }: Props) {
  const { expenses, isLoading } = useExpenses(userId)
  const { mutate: deleteExpense } = useDeleteExpense(userId)
  const { mutate: togglePaid } = useTogglePaid(userId)

  const [showForm, setShowForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [quitacaoExpense, setQuitacaoExpense] = useState<{ expense: Expense; parentId: number | null } | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())
  const [addingChildFor, setAddingChildFor] = useState<Expense | null>(null)

  // Apenas raiz (parentId === null)
  const rootExpenses = expenses.filter((e) => e.parentId === null)

  const totalPago = rootExpenses.reduce((acc, e) => acc + (e.status === "pago" ? e.amount : 0), 0)
  const totalPendente = rootExpenses.reduce((acc, e) => acc + (e.status !== "pago" ? e.amount : 0), 0)

  function handleDelete(id: number) {
    setDeletingId(id)
    deleteExpense(id, {
      onSuccess: () => { toast.success("Gasto excluído."); setDeletingId(null) },
      onError: () => { toast.error("Erro ao excluir."); setDeletingId(null) },
    })
  }

  function handleTogglePaid(id: number, currentStatus: string, parentId?: number | null) {
    togglePaid({ id, currentStatus, parentId }, { onError: () => toast.error("Erro ao alterar status.") })
  }

  function handleEdit(expense: Expense) {
    setShowForm(false)
    setEditingExpense(expense)
  }

  function toggleExpand(id: number) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {next.delete(id)} else next.add(id)
      return next
    })
  }

  if (isLoading) return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  )

  return (
    <TooltipProvider>
      <div className="p-6 max-w-6xl mx-auto space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Fluxo de Caixa</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Gerencie seus gastos e despesas.</p>
          </div>
          <Button onClick={() => { setEditingExpense(null); setShowForm((v) => !v) }}>
            <Plus className="size-4" /> Novo Gasto
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="py-4"><CardHeader className="pb-1">
            <CardDescription>Total de registros</CardDescription>
            <CardTitle className="text-2xl">{rootExpenses.length}</CardTitle>
          </CardHeader></Card>
          <Card className="py-4"><CardHeader className="pb-1">
            <CardDescription>Total pago</CardDescription>
            <CardTitle className="text-2xl text-green-600">R$ {totalPago.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</CardTitle>
          </CardHeader></Card>
          <Card className="py-4"><CardHeader className="pb-1">
            <CardDescription>Total pendente</CardDescription>
            <CardTitle className="text-2xl text-destructive">R$ {totalPendente.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</CardTitle>
          </CardHeader></Card>
        </div>

        {showForm && (
          <Card>
            <CardHeader><CardTitle className="text-base">Novo Gasto</CardTitle><CardDescription>Preencha os dados da despesa.</CardDescription></CardHeader>
            <Separator />
            <CardContent className="pt-5"><NovoGastoForm userId={userId} onClose={() => setShowForm(false)} /></CardContent>
          </Card>
        )}

        {editingExpense && (
          <Card>
            <CardHeader><CardTitle className="text-base">Editar Gasto</CardTitle><CardDescription>Altere os dados da despesa.</CardDescription></CardHeader>
            <Separator />
            <CardContent className="pt-5"><EditGastoForm userId={userId} expense={editingExpense} onClose={() => setEditingExpense(null)} /></CardContent>
          </Card>
        )}

        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead className="w-10" />
                <TableHead>Vencimento</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="w-14 text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rootExpenses.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-12">
                  Nenhum gasto registrado. Clique em "Novo Gasto" para começar.
                </TableCell></TableRow>
              ) : rootExpenses.map((expense) => {
                const isExpanded = expandedIds.has(expense.id)
                const hasChildren = expense.isGroup === 1

                return (
                  <>
                    <TableRow key={expense.id} className={expense.status === "pago" ? "opacity-60" : ""}>
                      <TableCell className="pr-0">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button onClick={() => toggleExpand(expense.id)}
                              className={`flex items-center justify-center size-6 rounded transition-colors ${hasChildren ? "text-primary hover:bg-primary/10" : "text-muted-foreground/30 cursor-default"}`}>
                              {isExpanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>{hasChildren ? (isExpanded ? "Recolher sub-gastos" : "Ver sub-gastos") : "Sem sub-gastos"}</TooltipContent>
                        </Tooltip>
                      </TableCell>

                      <TableCell>
                        <button onClick={() => handleTogglePaid(expense.id, expense.status)}
                          title={expense.status === "pago" ? "Marcar como pendente" : "Marcar como pago"}
                          className="text-muted-foreground hover:text-foreground transition-colors">
                          {expense.status === "pago"
                            ? <CheckCircle2 className="size-4 text-green-500" />
                            : <Circle className="size-4" />}
                        </button>
                      </TableCell>

                      <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                        {expense.dueDate ? new Date(expense.dueDate).toLocaleDateString("pt-BR") : "—"}
                      </TableCell>

                      <TableCell className="font-medium">
                        {expense.description}
                        {hasChildren && <Badge variant="secondary" className="ml-2 text-xs">grupo</Badge>}
                      </TableCell>

                      <TableCell className="text-sm text-muted-foreground">{(expense as any).categoryName ?? "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{(expense as any).paymentMethodName ?? "—"}</TableCell>

                      <TableCell className="text-right font-semibold tabular-nums">
                        R$ {Number(expense.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </TableCell>

                      <TableCell className="text-center">
                        {expense.status === "pago"
                          ? <Badge className="bg-green-500 hover:bg-green-600">Pago</Badge>
                          : expense.status === "parcial"
                          ? <Badge className="bg-yellow-500 hover:bg-yellow-600">Parcial</Badge>
                          : <Badge variant="destructive">Pendente</Badge>}
                      </TableCell>

                      <TableCell className="text-center">
                        <GastoActionsMenu
                          expense={expense}
                          isDeleting={deletingId === expense.id}
                          onAddChild={(exp) => {
                            setAddingChildFor(exp)
                            setExpandedIds((prev) => new Set([...prev, exp.id]))
                          }}
                          onQuitacao={(exp) => setQuitacaoExpense({ expense: exp, parentId: null })}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      </TableCell>
                    </TableRow>

                    {isExpanded && (
                      <SubGastosRows
                        key={`children-${expense.id}`}
                        parentId={expense.id}
                        userId={userId}
                        deletingId={deletingId}
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                        onQuitacao={(exp) => setQuitacaoExpense({ expense: exp, parentId: expense.id })}
                        onTogglePaid={(id, status) => handleTogglePaid(id, status, expense.id)}
                      />
                    )}
                  </>
                )
              })}
            </TableBody>
          </Table>
        </div>

        <QuitacaoDialog
          userId={userId}
          expense={quitacaoExpense?.expense ?? null}
          parentId={quitacaoExpense?.parentId ?? null}
          open={quitacaoExpense !== null}
          onOpenChange={(open) => { if (!open) setQuitacaoExpense(null) }}
        />

        {addingChildFor && (
          <NovoGastoFilhoDialog
            userId={userId}
            parentExpense={addingChildFor}
            open={true}
            onOpenChange={(open) => { if (!open) setAddingChildFor(null) }}
          />
        )}
      </div>
    </TooltipProvider>
  )
}
