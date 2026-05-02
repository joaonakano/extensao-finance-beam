import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { z } from "zod"

declare module "@tanstack/react-table" {
  interface TableMeta<TData> {
    onView?: (row: TData) => void
    onEdit?: (row: TData) => void
    onDelete?: (row: TData) => void
  }
}

// this type is used to define the shape of our data
// you can use zod schema here if you want
export const paymentMethodSchema = z.object({
    id: z.number(),
    name: z.string().min(1, "Nome obrigatório"),
    type: z.enum(["pix", "cartao_credito", "cartao_debito", "dinheiro", "outro"]).default("outro"),
    status: z.enum(["ativo", "inativo"]).default("ativo"),
})

export const paymentMethodFormat = {
    pix: "PIX",
    cartao_credito: "Cartão de Crédito",
    cartao_debito: "Cartão de Débito",
    dinheiro: "Dinheiro",
    outro: "Outro"
}

export type PaymentMethod = z.infer<typeof paymentMethodSchema>

export const columns: ColumnDef<PaymentMethod>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
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
        cell: ({ row }) => <div className="text-left font-medium">{row.getValue("name")}</div>
    },
    {
        accessorKey: "type",
        header: () => <div className="text-left">Tipo</div>,
        cell: ({ row }) => <div className="text-left font-medium">{paymentMethodFormat[row.getValue("type") as keyof typeof paymentMethodFormat]}</div>
    },
    {
        accessorKey: "status",
        header: () => <div className="text-left">Status</div>,
        cell: ({ row }) => {
            const status = row.getValue("status")

            return (
                <div className="text-left">
                    <Badge
                        className={
                            status === "ativo"
                                ? "bg-green-500 hover:bg-green-600 text-white"
                                : "bg-red-500 hover:bg-red-600 text-white"
                        }
                    >
                        {status === "ativo" ? "Ativo" : "Inativo"}
                    </Badge>
                </div>
            )
        },
    },
    {
        id: "actions",
        header: () => <div className="text-left">Ações</div>,
        cell: ({ row, table }) => {
            const paymentMethod = row.original

            const onView = table.options.meta?.onView
            const onEdit = table.options.meta?.onEdit
            const onDelete = table.options.meta?.onDelete


            return (
                <div className="text-left">
                    <DropdownMenu>
                    <DropdownMenuTrigger>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir Menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onView?.(paymentMethod)}>
                            Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onEdit?.(paymentMethod)}>
                            Editar
                        </DropdownMenuItem>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                    className="w-full text-destructive focus:text-destructive"
                                    onSelect={(e) => e.preventDefault()}
                                >
                                    Excluir
                                </DropdownMenuItem>
                            </AlertDialogTrigger>

                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Tem Certeza?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Essa ação não poderá ser desfeita. Isso irá excluir o meio de pagamento permanentemente.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>

                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => onDelete?.(paymentMethod)}
                                        className="bg-destructive text-white hover:bg-destructive/90"
                                        >
                                        Excluir
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </DropdownMenuContent>
                </DropdownMenu>
                </div>
            )
        }
    },
]