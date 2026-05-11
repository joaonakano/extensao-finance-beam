import { useQuery } from "@tanstack/react-query"
import { handleApi } from "@/services/api"
import type { Category, PaymentMethod } from "@/env"

export function useCategories(_userId?: number) {
  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => handleApi(window.api.categories.getAll()),
  })
  return { categories: (data ?? []) as Category[], isLoading }
}

export function usePaymentMethods(_userId?: number) {
  const { data, isLoading } = useQuery({
    queryKey: ["paymentMethods"],
    queryFn: () => handleApi(window.api.paymentMethods.getAll()),
  })
  return { paymentMethods: (data ?? []) as PaymentMethod[], isLoading }
}
