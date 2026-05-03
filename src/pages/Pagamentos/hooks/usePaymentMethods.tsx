import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { PaymentMethod } from "../columns"
import { handleApi } from "@/services/api"

export function usePaymentMethods(userId: number) {
    const queryClient = useQueryClient()

    // Get
    const query = useQuery({
        queryKey: ["payment-methods"],
        queryFn: () => 
            handleApi<PaymentMethod[]>(
                window.api.paymentMethods.getAll(userId)
            )
    })

    // Create
    const create = useMutation({
        mutationFn: (data: any) =>
            handleApi(
                window.api.paymentMethods.create(data)
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payment-methods", userId] })
        }
    })

    const update = useMutation({
        mutationFn: (data: any) =>
            handleApi(
                window.api.paymentMethods.update(data)
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payment-methods", userId] })
        }
    })
    
    // Delete
    const remove = useMutation({
        mutationFn: (id: number) =>
            handleApi(
                window.api.paymentMethods.delete(id)
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payment-methods", userId] })
        }
    })

    return {
        ...query,
        create,
        update,
        remove
    }
}