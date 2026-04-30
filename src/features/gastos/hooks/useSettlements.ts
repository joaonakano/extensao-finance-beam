import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

// Busca todas as quitações de uma despesa
export function useSettlements(expenseId: number | null) {
  const { data, isLoading } = useQuery({
    queryKey: ["settlements", expenseId],
    queryFn: () => window.api.settlements.getByExpense(expenseId!),
    enabled: expenseId != null,
  })
  return { settlements: data ?? [], isLoading }
}

// Cria uma quitação
export function useCreateSettlement(userId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (settlement: { expense_id: number; amount_paid: number; payment_date: string }) =>
      window.api.settlements.create(settlement),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["expenses", userId] })
      qc.invalidateQueries({ queryKey: ["settlements", vars.expense_id] })
    },
  })
}
