import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { PaymentMethod, paymentMethodSchema } from "../components/columns"


const QUERY_KEY = ["payment-methods"]

export function usePaymentMethods(userId = 1) {
    const queryClient = useQueryClient()

    // -- Get ------------------------------
    const query = useQuery({
        queryKey: QUERY_KEY,
        queryFn: async () => {
            const data = await window.api.paymentMethods.getAll(userId)
            
            return paymentMethodSchema.array().parse(data)
        },
    })
    
    // -- Delete ------------------------------
    const removeMutation = useMutation({
        mutationFn: (id: number) => window.api.paymentMethods.delete(id),
        onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["payment-methods"] })
        }
    })

    return {
        ...query,
        remove: removeMutation.mutate,
        isRemoving: removeMutation.isPending
    }
}