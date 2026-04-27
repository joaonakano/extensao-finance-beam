// Importando o TanStack Query
import { useQuery } from "@tanstack/react-query";

export function useExpenses(userId: number) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['expenses', userId],
    queryFn: () => window.api.expenses.getAll(userId)
  });

  return { 
    expenses: data ?? [], 
    isLoading,
    error 
  };
}