import { Loader2, Trash2, Pencil, Banknote, CheckCircle2, Circle } from "lucide-react"
import { TableRow, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useChildExpenses } from "../hooks/useExpenses"

interface Props {
  parentId: number
  userId: number
  deletingId: number | null
  onDelete: (id: number) => void
  onEdit: (expense: any) => void
  onQuitacao: (expense: any) => void
  onTogglePaid: (id: number) => void
}

export function SubGastosRows({ parentId, deletingId, onDelete, onEdit, onQuitacao, onTogglePaid }: Props) {
  const { children, isLoading } = useChildExpenses(parentId)

  if (isLoading) {
    return (
      <TableRow>
        <TableCell colSpan={9} className="py-2 pl-12 text-muted-foreground text-sm">
          <Loader2 className="size-3.5 animate-spin inline mr-2" />
          Carregando sub-gastos...
        </TableCell>
      </TableRow>
    )
  }

  if (children.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={9} className="py-2 pl-12 text-muted-foreground text-sm italic">
          Nenhum sub-gasto cadastrado.
        </TableCell>
      </TableRow>
    )
  }

  return (
    <>
      {children.map((child: any) => (
        <TableRow
          key={child.id}
          className={`bg-muted/30 border-l-2 border-l-primary/20 ${child.is_paid ? "opacity-60" : ""}`}
        >
          {/* Célula vazia — alinha com a coluna expand/collapse do pai */}
          <TableCell />

          {/* Toggle pago */}
          <TableCell>
            <button
              onClick={() => onTogglePaid(child.id)}
              title={child.is_paid ? "Marcar como pendente" : "Marcar como pago"}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {child.is_paid
                ? <CheckCircle2 className="size-3.5 text-green-500" />
                : <Circle className="size-3.5" />}
            </button>
          </TableCell>

          {/* Data */}
          <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
            {new Date(child.date).toLocaleDateString("pt-BR")}
          </TableCell>

          {/* Descrição com indentação visual */}
          <TableCell className="text-sm">
            <span className="text-muted-foreground mr-1.5 select-none">└</span>
            <span className="font-medium">{child.description}</span>
            {child.is_recurring ? (
              <Badge variant="outline" className="ml-2 text-xs">Recorrente</Badge>
            ) : null}
          </TableCell>

          {/* Categoria */}
          <TableCell>
            <span className="flex items-center gap-1.5 text-xs">
              <span style={{ color: child.category_color }}>●</span>
              {child.category_name}
            </span>
          </TableCell>

          {/* Pagamento */}
          <TableCell className="text-xs text-muted-foreground">
            {child.payment_method_name}
          </TableCell>

          {/* Valor */}
          <TableCell className="text-right font-semibold tabular-nums text-sm">
            <div className="flex flex-col items-end gap-0.5">
              <span>R$ {Number(child.remaining_amount ?? child.total).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
              {child.amount_paid > 0 && (
                <span className="text-xs text-muted-foreground">
                  (+R$ {Number(child.amount_paid).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} pago)
                </span>
              )}
            </div>
          </TableCell>

          {/* Status */}
          <TableCell className="text-center">
            {child.is_paid
              ? <Badge className="bg-green-500 hover:bg-green-600 text-xs">Pago</Badge>
              : <Badge variant="destructive" className="text-xs">Pendente</Badge>}
          </TableCell>

          {/* Ações */}
          <TableCell>
            <div className="flex items-center justify-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onQuitacao(child)}
                    className="text-muted-foreground hover:text-amber-600"
                  >
                    <Banknote className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Registrar quite</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onEdit(child)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Editar sub-gasto</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onDelete(child.id)}
                    disabled={deletingId === child.id}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    {deletingId === child.id
                      ? <Loader2 className="size-3.5 animate-spin" />
                      : <Trash2 className="size-3.5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Excluir sub-gasto</TooltipContent>
              </Tooltip>
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}
