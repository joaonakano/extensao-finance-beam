import { useMemo } from "react"
import { TrendingDown, Receipt, Tag, CreditCard, AlertCircle, Loader2 } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { useExpenses } from "@/features/expenses/hooks/useExpenses"

interface Props {
  userId: number
}

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export function DashboardPage({ userId }: Props) {
  const { expenses, isLoading } = useExpenses(userId)

  const stats = useMemo(() => {
    if (!expenses.length) return null

    const today = new Date().toISOString().slice(0, 10)
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)
    const monthStr = today.slice(0, 7)

    const total = expenses.reduce((s: number, e: any) => s + Number(e.total), 0)
    const hoje = expenses.filter((e: any) => e.date === today).reduce((s: number, e: any) => s + Number(e.remaining_amount ?? e.total), 0)
    const semana = expenses.filter((e: any) => e.date >= weekAgo).reduce((s: number, e: any) => s + Number(e.remaining_amount ?? e.total), 0)
    const mes = expenses.filter((e: any) => e.date.startsWith(monthStr)).reduce((s: number, e: any) => s + Number(e.remaining_amount ?? e.total), 0)

    const pagos = expenses.reduce((s: number, e: any) => s + Number(e.amount_paid ?? 0), 0)
    const pendente = expenses.reduce((s: number, e: any) => s + Number(e.remaining_amount ?? 0), 0)

    const catMap: Record<string, { total: number; color: string }> = {}
    expenses.forEach((e: any) => {
      const name = e.category_name ?? "Sem categoria"
      const color = e.category_color ?? "#6b7280"
      if (!catMap[name]) catMap[name] = { total: 0, color }
      catMap[name].total += Number(e.remaining_amount ?? e.total)
    })
    const cats = Object.entries(catMap).sort((a, b) => b[1].total - a[1].total)
    const maxCat = cats[0]?.[1].total ?? 1

    const pmMap: Record<string, number> = {}
    expenses.forEach((e: any) => {
      const name = e.payment_method_name ?? "Não informado"
      pmMap[name] = (pmMap[name] ?? 0) + Number(e.remaining_amount ?? e.total)
    })
    const pms = Object.entries(pmMap).sort((a, b) => b[1] - a[1])

    const recent = [...expenses].slice(0, 6)

    return { total, hoje, semana, mes, pagos, pendente, cats, maxCat, pms, recent, count: expenses.length }
  }, [expenses])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Visão geral dos seus gastos</p>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="py-4">
          <CardHeader className="pb-1">
            <CardDescription className="flex items-center gap-1.5">
              <Receipt className="size-3.5" /> Hoje
            </CardDescription>
            <CardTitle className="text-xl">{fmt(stats?.hoje ?? 0)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="py-4">
          <CardHeader className="pb-1">
            <CardDescription className="flex items-center gap-1.5">
              <TrendingDown className="size-3.5" /> Esta semana
            </CardDescription>
            <CardTitle className="text-xl">{fmt(stats?.semana ?? 0)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="py-4">
          <CardHeader className="pb-1">
            <CardDescription className="flex items-center gap-1.5">
              <TrendingDown className="size-3.5" /> Este mês
            </CardDescription>
            <CardTitle className="text-xl">{fmt(stats?.mes ?? 0)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="py-4">
          <CardHeader className="pb-1">
            <CardDescription className="flex items-center gap-1.5">
              <Receipt className="size-3.5" /> Total geral
            </CardDescription>
            <CardTitle className="text-xl">{fmt(stats?.total ?? 0)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {!stats ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <AlertCircle className="size-10 text-muted-foreground/40" />
            <p className="text-muted-foreground">Nenhum gasto registrado ainda.</p>
            <p className="text-sm text-muted-foreground/70">Acesse "Fluxo de Caixa" para adicionar suas despesas.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Status + Categorias */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Status de pagamentos</CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4 space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-muted-foreground">Pago</span>
                    <span className="font-medium text-green-600">{fmt(stats.pagos)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-green-500 transition-all"
                      style={{ width: stats.total > 0 ? `${(stats.pagos / stats.total) * 100}%` : "0%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-muted-foreground">Pendente</span>
                    <span className="font-medium text-destructive">{fmt(stats.pendente)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-destructive transition-all"
                      style={{ width: stats.total > 0 ? `${(stats.pendente / stats.total) * 100}%` : "0%" }} />
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total registros</p>
                    <p className="font-semibold text-lg">{stats.count}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Ticket médio</p>
                    <p className="font-semibold text-lg">{fmt(stats.total / stats.count)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <Tag className="size-3.5" /> Gastos por categoria
                </CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4 space-y-3">
                {stats.cats.slice(0, 5).map(([name, { total, color }]) => (
                  <div key={name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="flex items-center gap-1.5">
                        <span style={{ color }} className="text-base leading-none">●</span>
                        {name}
                      </span>
                      <span className="font-medium tabular-nums">{fmt(total)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${(total / stats.maxCat) * 100}%`, backgroundColor: color }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Meios de pagamento + Últimos gastos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <CreditCard className="size-3.5" /> Por meio de pagamento
                </CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4 space-y-3">
                {stats.pms.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sem dados</p>
                ) : (
                  stats.pms.map(([name, total]) => (
                    <div key={name} className="flex justify-between text-sm">
                      <span className="text-muted-foreground truncate mr-2">{name}</span>
                      <span className="font-medium tabular-nums shrink-0">{fmt(total)}</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Últimos gastos</CardTitle>
              </CardHeader>
              <Separator />
              <div className="rounded-b-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.recent.map((e: any) => (
                      <TableRow key={e.id} className={e.status === "pago" ? "opacity-60" : ""}>
                        <TableCell className="font-medium text-sm">{e.description}</TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1.5 text-sm">
                            <span style={{ color: e.category_color }}>●</span>
                            {e.category_name}
                          </span>
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-sm font-semibold">
                          {fmt(Number(e.total))}
                        </TableCell>
                        <TableCell className="text-center">
                          {e.status === "pago"
                            ? <Badge className="bg-green-500 hover:bg-green-600 text-xs">Pago</Badge>
                            : <Badge variant="destructive" className="text-xs">Pendente</Badge>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
