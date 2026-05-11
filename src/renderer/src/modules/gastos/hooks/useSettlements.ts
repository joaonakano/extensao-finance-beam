import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { handleApi } from "@/services/api"
import type { Settlement, CreateSettlementDTO } from "@/env"

export function useSettlements(expenseId: number | null) {
  const { data, isLoading } = useQuery({
    queryKey: ["settlements", expenseId],
    queryFn: () => handleApi(window.api.settlements.getByExpense(expenseId!)),
    enabled: expenseId != null,
  })
  return { settlements: (data ?? []) as Settlement[], isLoading }
}

export function useCreateSettlement(_userId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (settlement: CreateSettlementDTO & { parentId?: number | null }) => {
      const { parentId: _p, ...dto } = settlement
      return handleApi(window.api.settlements.create(dto))
    },
    onSuccess: (_data, { expenseId, parentId }) => {
      qc.invalidateQueries({ queryKey: ["expenses"] })
      qc.invalidateQueries({ queryKey: ["settlements", expenseId] })
      if (parentId) {
        qc.invalidateQueries({ queryKey: ["expenses", "children", parentId] })
      }
    },
  })
}
