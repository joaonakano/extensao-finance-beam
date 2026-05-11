import { Loader2, CheckCircle2, Circle } from "lucide-react"
import { TableRow, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useChildExpenses } from "../hooks/useExpenses"
import { GastoActionsMenu } from "./GastoActionsMenu"
import type { Expense } from "@/env"

interface Props {
  parentId: number
  userId: number
  deletingId: number | null
  onDelete: (id: number) => void
  onEdit: (expense: Expense) => void
  onQuitacao: (expense: Expense) => void
  onTogglePaid: (id: number, currentStatus: string) => void
}

export function SubGastosRows({ parentId, deletingId, onDelete, onEdit, onQuitacao, onTogglePaid }: Props) {
  const { children, isLoading } = useChildExpenses(parentId)

  if (isLoading) return (
    <TableRow><TableCell colSpan={9} className="py-2 pl-12 text-muted-foreground text-sm">
      <Loader2 className="size-3.5 animate-spin inline mr-2" />Carregando sub-gastos...
    </TableCell></TableRow>
  )

  if (children.length === 0) return (
    <TableRow><TableCell colSpan={9} className="py-2 pl-12 text-muted-foreground text-sm italic">
      Nenhum sub-gasto cadastrado.
    </TableCell></TableRow>
  )

  return (
    <>
      {children.map((child) => (
        <TableRow key={child.id} className={`bg-muted/30 border-l-2 border-l-primary/20 ${child.status === "pago" ? "opacity-60" : ""}`}>
          <TableCell />

          <TableCell>
            <button onClick={() => onTogglePaid(child.id, child.status)}
              title={child.status === "pago" ? "Marcar como pendente" : "Marcar como pago"}
              className="text-muted-foreground hover:text-foreground transition-colors">
              {child.status === "pago"
                ? <CheckCircle2 className="size-3.5 text-green-500" />
                : <Circle className="size-3.5" />}
            </button>
          </TableCell>

          <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
            {child.dueDate ? new Date(child.dueDate).toLocaleDateString("pt-BR") : "—"}
          </TableCell>

          <TableCell className="text-sm">
            <span className="text-muted-foreground mr-1.5 select-none">└</span>
            <span className="font-medium">{child.description}</span>
            {child.installmentNumber && (
              <Badge variant="outline" className="ml-2 text-xs">
                {child.installmentNumber}/{child.installmentTotal}
              </Badge>
            )}
          </TableCell>

          <TableCell className="text-xs text-muted-foreground">{(child as any).categoryName ?? "—"}</TableCell>
          <TableCell className="text-xs text-muted-foreground">{(child as any).paymentMethodName ?? "—"}</TableCell>

          <TableCell className="text-right font-semibold tabular-nums text-sm">
            R$ {Number(child.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </TableCell>

          <TableCell className="text-center">
            {child.status === "pago"
              ? <Badge className="bg-green-500 hover:bg-green-600 text-xs">Pago</Badge>
              : child.status === "parcial"
              ? <Badge className="bg-yellow-500 hover:bg-yellow-600 text-xs">Parcial</Badge>
              : <Badge variant="destructive" className="text-xs">Pendente</Badge>}
          </TableCell>

          <TableCell className="text-center">
            <GastoActionsMenu
              expense={child}
              isChild
              isDeleting={deletingId === child.id}
              onQuitacao={onQuitacao}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}
