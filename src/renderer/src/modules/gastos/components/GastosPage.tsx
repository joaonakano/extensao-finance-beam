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

interface Props {
  userId: number
}

export function GastosPage({ userId }: Props) {
  const { expenses, isLoading } = useExpenses(userId)
  const { mutate: deleteExpense } = useDeleteExpense(userId)
  const { mutate: togglePaid } = useTogglePaid(userId)

  const [showForm, setShowForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<any | null>(null)
  const [quitacaoExpense, setQuitacaoExpense] = useState<any | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())
  const [addingChildFor, setAddingChildFor] = useState<any | null>(null)

  const totalPago = expenses.reduce((acc: number, e: any) => acc + (e.amount_paid ?? 0), 0)
  const totalPendente = expenses.reduce((acc: number, e: any) => acc + (e.remaining_amount ?? 0), 0)

  function handleDelete(id: number) {
    setDeletingId(id)
    deleteExpense(id, {
      onSuccess: () => { toast.success("Gasto excluído."); setDeletingId(null) },
      onError: () => { toast.error("Erro ao excluir gasto."); setDeletingId(null) },
    })
  }

  function handleTogglePaid(id: number) {
    togglePaid(id, { onError: () => toast.error("Erro ao alterar status.") })
  }

  function handleEdit(expense: any) {
    setShowForm(false)
    setEditingExpense(expense)
  }

  function handleOpenNew() {
    setEditingExpense(null)
    setShowForm((v) => !v)
  }

  function toggleExpand(id: number) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="p-6 max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Fluxo de Caixa</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Gerencie seus gastos e despesas.</p>
          </div>
          <Button onClick={handleOpenNew}>
            <Plus className="size-4" />
            Novo Gasto
          </Button>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="py-4">
            <CardHeader className="pb-1">
              <CardDescription>Total de registros</CardDescription>
              <CardTitle className="text-2xl">{expenses.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="py-4">
            <CardHeader className="pb-1">
              <CardDescription>Total pago</CardDescription>
              <CardTitle className="text-2xl text-green-600">
                R$ {totalPago.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="py-4">
            <CardHeader className="pb-1">
              <CardDescription>Total pendente</CardDescription>
              <CardTitle className="text-2xl text-destructive">
                R$ {totalPendente.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Formulário novo gasto */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Novo Gasto</CardTitle>
              <CardDescription>Preencha os dados da despesa.</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-5">
              <NovoGastoForm userId={userId} onClose={() => setShowForm(false)} />
            </CardContent>
          </Card>
        )}

        {/* Formulário edição */}
        {editingExpense && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Editar Gasto</CardTitle>
              <CardDescription>Altere os dados da despesa.</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-5">
              <EditGastoForm userId={userId} expense={editingExpense} onClose={() => setEditingExpense(null)} />
            </CardContent>
          </Card>
        )}

        {/* Tabela */}
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead className="w-10"></TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="w-14 text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-12">
                    Nenhum gasto registrado. Clique em "Novo Gasto" para começar.
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((expense: any) => {
                  const isExpanded = expandedIds.has(expense.id)
                  const hasChildren = (expense.children_count ?? 0) > 0

                  return (
                    <>
                      <TableRow
                        key={expense.id}
                        className={expense.is_paid ? "opacity-60" : ""}
                      >
                        {/* Expand/collapse */}
                        <TableCell className="pr-0">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => toggleExpand(expense.id)}
                                className={`
                                  flex items-center justify-center size-6 rounded transition-colors
                                  ${hasChildren
                                    ? "text-primary hover:bg-primary/10"
                                    : "text-muted-foreground/30 cursor-default"
                                  }
                                `}
                              >
                                {isExpanded
                                  ? <ChevronDown className="size-3.5" />
                                  : <ChevronRight className="size-3.5" />}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {hasChildren
                                ? isExpanded ? "Recolher sub-gastos" : `Ver ${expense.children_count} sub-gasto(s)`
                                : "Sem sub-gastos"}
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>

                        {/* Toggle pago */}
                        <TableCell>
                          <button
                            onClick={() => handleTogglePaid(expense.id)}
                            title={expense.is_paid ? "Marcar como pendente" : "Marcar como pago"}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {expense.is_paid
                              ? <CheckCircle2 className="size-4 text-green-500" />
                              : <Circle className="size-4" />}
                          </button>
                        </TableCell>

                        <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                          {new Date(expense.date).toLocaleDateString("pt-BR")}
                        </TableCell>

                        <TableCell className="font-medium">
                          {expense.description}
                          {expense.is_recurring
                            ? <Badge variant="outline" className="ml-2 text-xs">Recorrente</Badge>
                            : null}
                          {hasChildren && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              {expense.children_count} sub
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell>
                          <span className="flex items-center gap-1.5 text-sm">
                            <span style={{ color: expense.category_color }}>●</span>
                            {expense.category_name}
                          </span>
                        </TableCell>

                        <TableCell className="text-sm text-muted-foreground">
                          {expense.payment_method_name}
                        </TableCell>

                        <TableCell className="text-right font-semibold tabular-nums">
                          <div className="flex flex-col items-end gap-0.5">
                            <span>R$ {Number(expense.remaining_amount ?? expense.total).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                            {expense.amount_paid > 0 && (
                              <span className="text-xs text-muted-foreground">
                                (+R$ {Number(expense.amount_paid).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} pago)
                              </span>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="text-center">
                          {expense.is_paid
                            ? <Badge className="bg-green-500 hover:bg-green-600">Pago</Badge>
                            : <Badge variant="destructive">Pendente</Badge>}
                        </TableCell>

                        {/* Menu de contexto — GastoActionsMenu */}
                        <TableCell className="text-center">
                          <GastoActionsMenu
                            expense={expense}
                            isDeleting={deletingId === expense.id}
                            onAddChild={(exp) => {
                              setAddingChildFor(exp)
                              setExpandedIds((prev) => new Set([...prev, exp.id]))
                            }}
                            onQuitacao={setQuitacaoExpense}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                          />
                        </TableCell>
                      </TableRow>

                      {/* Linhas filhas */}
                      {isExpanded && (
                        <SubGastosRows
                          key={`children-${expense.id}`}
                          parentId={expense.id}
                          userId={userId}
                          deletingId={deletingId}
                          onDelete={handleDelete}
                          onEdit={handleEdit}
                          onQuitacao={setQuitacaoExpense}
                          onTogglePaid={handleTogglePaid}
                        />
                      )}
                    </>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Dialog de Quitação */}
        <QuitacaoDialog
          userId={userId}
          expense={quitacaoExpense}
          open={quitacaoExpense !== null}
          onOpenChange={(open) => { if (!open) setQuitacaoExpense(null) }}
        />

        {/* Dialog de Novo Sub-gasto */}
        {addingChildFor && (
          <NovoGastoFilhoDialog
            userId={userId}
            parentExpense={addingChildFor}
            open={addingChildFor !== null}
            onOpenChange={(open) => { if (!open) setAddingChildFor(null) }}
          />
        )}

      </div>
    </TooltipProvider>
  )
}
