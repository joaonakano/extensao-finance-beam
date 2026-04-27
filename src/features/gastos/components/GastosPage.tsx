import { useExpenses } from "@/features/gastos/hooks/useExpenses"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function GastosPage() {
  const userId = 1 // No futuro, pegas do contexto de Auth
  const { expenses, isLoading } = useExpenses(userId)

  if (isLoading) return <div className="p-10">A carregar finanças...</div>

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Fluxo de Caixa</h1>
        <Button>Novo Gasto</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Pagamento</TableHead>
              <TableHead className="text-right">Valor Total</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>{new Date(expense.date).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell className="font-medium">
                  {expense.description}
                  {expense.is_recurring ? <Badge variant="outline" className="ml-2">Recorrente</Badge> : null}
                </TableCell>
                <TableCell>
                  <span style={{ color: expense.category_color }}>
                    ● {expense.category_name}
                  </span>
                </TableCell>
                <TableCell>{expense.payment_method_name}</TableCell>
                <TableCell className="text-right font-bold">
                  R$ {expense.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-center">
                   {expense.is_paid ? 
                    <Badge className="bg-green-500">Pago</Badge> : 
                    <Badge variant="destructive">Pendente</Badge>
                   }
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}