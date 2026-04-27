// Importando o TanStack Query
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useExpenses(userId: number) {
    const queryClient = useQueryClient()

    // Busca todos os gastos
    const expensesQuery = useQuery({
        queryKey: ['expenses', userId],
        queryFn: () => window.api.expenses.getAll(userId)
    })

    // Mutação cria gasto (React Query cuidando do loading/error)
    const createExpenseMutation = useMutation({
        mutationFn: window.api.expenses.create,
        onSuccess: () => {
            // Ele avisa o React para atualizar a lista sozinho
            queryClient.invalidateQueries({ queryKey: ['expenses'] })
        }
    })

    return {
        expenses: expensesQuery.data ?? [],
        isLoading: expensesQuery.isLoading,
        createExpense: createExpenseMutation.mutate,
    }
}