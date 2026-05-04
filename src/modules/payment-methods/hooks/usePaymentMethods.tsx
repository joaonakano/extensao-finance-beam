import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { handleApi } from "@/services/api"
import { CreatePaymentMethod, PaymentMethod, UpdatePaymentMethod } from "../schema"

export function usePaymentMethods(userId: number) {
    const queryClient = useQueryClient()

    const queryKey = ["payment-methods", userId]

    // GET
const query = useQuery({
    queryKey,
    queryFn: () =>
        handleApi<PaymentMethod[]>(
            window.api.paymentMethods.getAll(userId)  // sem await — passa a Promise
        )
})

// Logo após o useQuery, adiciona:
console.log("[hook] query.data:", query.data)
console.log("[hook] query.status:", query.status)
console.log("[hook] query.fetchStatus:", query.fetchStatus)
console.log("[hook] query.error:", query.error)

    // CREATE
    const create = useMutation({
        mutationFn: (data: CreatePaymentMethod) => 
           handleApi(
            window.api.paymentMethods.create(data)
           ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey })
        }
    })

    // UPDATE
    const update = useMutation({
        mutationFn: (data: UpdatePaymentMethod) => 
            handleApi(
                window.api.paymentMethods.update(data)
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey })
        }
    })
    
    // DELETE
    const remove = useMutation({
        mutationFn: (id: number) =>
            handleApi(
                window.api.paymentMethods.delete(id)
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey })
        }
    })

    return {
        ...query,
        create,
        update,
        remove
    }
}