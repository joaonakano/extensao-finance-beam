import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { handleApi } from "@/services/api"
import type { GastoFormValues } from "../schemas"
import type { Expense, CreateExpenseDTO, UpdateExpenseDTO } from "@/env"

export function useExpenses(_userId: number) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["expenses"],
    queryFn: () => handleApi(window.api.expenses.getAll()),
  })
  return { expenses: (data ?? []) as Expense[], isLoading, error }
}

export function useChildExpenses(parentId: number | null) {
  const { data, isLoading } = useQuery({
    queryKey: ["expenses", "children", parentId],
    queryFn: () => handleApi(window.api.expenses.getChildren(parentId!)),
    enabled: parentId !== null,
  })
  return { children: (data ?? []) as Expense[], isLoading }
}

export function useCreateExpense(_userId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (values: GastoFormValues & { parentId?: number | null }) => {
      const dto: CreateExpenseDTO = {
        description: values.description,
        amount: Number(values.amount.replace(",", ".")),
        categoryId: Number(values.categoryId) || null,
        paymentMethodId: Number(values.paymentMethodId) || null,
        dueDate: values.dueDate || null,
        parentId: values.parentId ?? null,
      }
      return handleApi(window.api.expenses.create(dto))
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["expenses"] })
      if (variables.parentId) {
        qc.invalidateQueries({ queryKey: ["expenses", "children", variables.parentId] })
      }
    },
  })
}

export function useUpdateExpense(_userId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (expense: UpdateExpenseDTO) =>
      handleApi(window.api.expenses.update(expense)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["expenses"] }),
  })
}

export function useDeleteExpense(_userId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => handleApi(window.api.expenses.delete(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["expenses"] }),
  })
}

export function useTogglePaid(_userId: number) {
  const qc = useQueryClient()
  return useMutation({
    // Novo backend não tem togglePaid — usa update com status
    mutationFn: async ({ id, currentStatus }: { id: number; currentStatus: string; parentId?: number | null }) => {
      const newStatus = currentStatus === "pago" ? "pendente" : "pago"
      return handleApi(window.api.expenses.update({ id, status: newStatus as any }))
    },
    onSuccess: (_data, { parentId }) => {
      qc.invalidateQueries({ queryKey: ["expenses"] })
      if (parentId) {
        qc.invalidateQueries({ queryKey: ["expenses", "children", parentId] })
      }
    },
  })
}
