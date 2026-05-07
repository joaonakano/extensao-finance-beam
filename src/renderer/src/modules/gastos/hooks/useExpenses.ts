import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { GastoFormValues } from "../schemas"

export function useExpenses(userId: number) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["expenses", userId],
    queryFn: async () => {
      const res = await window.api.expenses.getAll(userId)
      return res
    },
  })

  const expenses = Array.isArray(data?.data)
    ? data.data
    : []

  return { expenses, isLoading, error }
}

export function useChildExpenses(parentId: number | null) {
  const { data, isLoading } = useQuery({
    queryKey: ["expenses", "children", parentId],
    queryFn: async () => {
      const res = await window.api.expenses.getChildrenByParent(parentId!)
      if (res && typeof res === "object" && "data" in res) return (res as any).data ?? []
      return res ?? []
    },
    enabled: parentId !== null,
  })
  return { children: (data as any[]) ?? [], isLoading }
}

export function useCreateExpense(userId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (values: GastoFormValues & { parent_id?: number | null }) =>
      window.api.expenses.create({
        user_id: userId,
        description: values.description,
        total: Number(values.total.replace(",", ".")),
        category_id: Number(values.category_id),
        payment_method_id: Number(values.payment_method_id),
        date: values.date,
        is_paid: values.is_paid ? 1 : 0,
        is_recurring: values.is_recurring ? 1 : 0,
        parent_id: values.parent_id ?? null,
      }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["expenses", userId] })
      if (variables.parent_id) {
        qc.invalidateQueries({ queryKey: ["expenses", "children", variables.parent_id] })
      }
    },
  })
}

export function useUpdateExpense(userId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (expense: any) => window.api.expenses.update(expense),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["expenses", userId] }),
  })
}

export function useDeleteExpense(userId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => window.api.expenses.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["expenses"] }),
  })
}

export function useTogglePaid(userId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => window.api.expenses.togglePaid(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["expenses"] }),
  })
}