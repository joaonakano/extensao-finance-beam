import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { GastoFormValues } from "../schemas"

export function useExpenses(userId: number) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["expenses", userId],
    queryFn: () => window.api.expenses.getAll(userId),
  })
  return { expenses: data ?? [], isLoading, error }
}

export function useCreateExpense(userId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (values: GastoFormValues) =>
      window.api.expenses.create({
        user_id: userId,
        description: values.description,
        total: Number(values.total.replace(",", ".")),
        category_id: Number(values.category_id),
        payment_method_id: Number(values.payment_method_id),
        date: values.date,
        is_paid: values.is_paid ? 1 : 0,
        is_recurring: values.is_recurring ? 1 : 0,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["expenses", userId] }),
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["expenses", userId] }),
  })
}

export function useTogglePaid(userId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => window.api.expenses.togglePaid(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["expenses", userId] }),
  })
}
