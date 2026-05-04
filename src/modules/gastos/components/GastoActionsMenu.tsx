import { Plus, Banknote, Pencil, Trash2, Loader2, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Props {
  expense: any
  /** Quando true, oculta "Adicionar sub-gasto" (linhas filhas) */
  isChild?: boolean
  isDeleting?: boolean
  onAddChild?: (expense: any) => void
  onQuitacao: (expense: any) => void
  onEdit: (expense: any) => void
  onDelete: (id: number) => void
}

export function GastoActionsMenu({
  expense,
  isChild = false,
  isDeleting = false,
  onAddChild,
  onQuitacao,
  onEdit,
  onDelete,
}: Props) {
  return (
    <DropdownMenu>
      {/* Mesmo padrão do columns.tsx: trigger sem asChild, botão dentro */}
      <DropdownMenuTrigger>
        <Button variant="ghost" className="h-8 w-8 p-0" disabled={isDeleting}>
          <span className="sr-only">Abrir Menu</span>
          {isDeleting
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <MoreHorizontal className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuLabel>{expense.description}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Adicionar sub-gasto — só gastos raiz */}
        {!isChild && (
          <DropdownMenuItem onClick={() => onAddChild?.(expense)}>
            <Plus className="h-4 w-4 mr-2 text-primary" />
            Adicionar sub-gasto
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={() => onQuitacao(expense)}>
          <Banknote className="h-4 w-4 mr-2 text-amber-500" />
          Registrar quite
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => onEdit(expense)}>
          <Pencil className="h-4 w-4 mr-2" />
          Editar
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Excluir com AlertDialog — mesmo padrão do columns.tsx */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={(e) => e.preventDefault()}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                O gasto <span className="font-medium text-foreground">"{expense.description}"</span> será
                excluído permanentemente.
                {!isChild && (
                  <span className="block mt-1 text-destructive/80">
                    Todos os sub-gastos vinculados também serão removidos.
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(expense.id)}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </DropdownMenuContent>
    </DropdownMenu>
  )
}
