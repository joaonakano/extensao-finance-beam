import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export function useCategories(userId: number) {
  const { data, isLoading } = useQuery({
    queryKey: ["categories", userId],
    queryFn: () => window.api.categories.getAll(userId),
  })
  return { categories: data ?? [], isLoading }
}

export function usePaymentMethods(userId: number) {
  const { data, isLoading } = useQuery({
    queryKey: ["paymentMethods", userId],
    queryFn: () => window.api.paymentMethods.getAll(userId),
  })
  return { paymentMethods: data ?? [], isLoading }
}
