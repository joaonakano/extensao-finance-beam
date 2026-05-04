import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { PaymentMethod } from "./schema"
import { paymentMethodFormat } from "./components/PagamentosViewDialog"

declare module "@tanstack/react-table" {
  interface TableMeta<TData> {
    onView?: (row: TData) => void
    onEdit?: (row: TData) => void
    onDelete?: (row: TData) => void
  }
}

export const columns: ColumnDef<PaymentMethod>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Selecionar todos"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Selecionar item"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: () => <div className="text-left">Nome</div>,
    cell: ({ row }) => <div className="text-left font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "type",
    header: () => <div className="text-left">Tipo</div>,
    cell: ({ row }) => (
      <div className="text-left font-medium">
        {paymentMethodFormat[row.getValue("type") as PaymentMethod["type"]]}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: () => <div className="text-left">Status</div>,
    cell: ({ row }) => {
      const status = row.getValue("status") as PaymentMethod["status"]
      return (
        <Badge className={status === "ativo" ? "bg-green-500 hover:bg-green-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"}>
          {status === "ativo" ? "Ativo" : "Inativo"}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    header: () => <div className="text-left">Ações</div>,
    cell: ({ row, table }) => {
      const pm = row.original
      const { onView, onEdit, onDelete } = table.options.meta ?? {}

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir Menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onView?.(pm)}>Visualizar</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit?.(pm)}>Editar</DropdownMenuItem>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  className="w-full text-destructive focus:text-destructive"
                  onSelect={(e) => e.preventDefault()}
                >
                  Inativar
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem Certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Essa ação poderá ser revertida posteriormente. Apenas meios de pagamentos com a situação "Ativo" poderão ser utilizados na criação de novos gastos.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    variant="outline"
                    size="sm"
                  >Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                
                    size="sm"
                    onClick={() => onDelete?.(pm)}
                   className="bg-orange-600 hover:bg-red-600 text-white"
                  >
                    Inativar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]