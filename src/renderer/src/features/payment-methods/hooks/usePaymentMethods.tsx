import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { handleApi } from "@/services/api"
import type { PaymentMethod } from "@/env"
import type { CreatePaymentMethod, UpdatePaymentMethod } from "../schema"

const QUERY_KEY = ["payment-methods"]

export function usePaymentMethods(_userId?: number) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => handleApi<PaymentMethod[]>(window.api.paymentMethods.getAll()),
  })

  const create = useMutation({
    mutationFn: (data: CreatePaymentMethod) =>
      handleApi(window.api.paymentMethods.create(data)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })

  const update = useMutation({
    mutationFn: (data: UpdatePaymentMethod) =>
      handleApi(window.api.paymentMethods.update(data)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })

  const remove = useMutation({
    mutationFn: (id: number) =>
      handleApi(window.api.paymentMethods.delete(id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })

  return { ...query, create, update, remove }
}
