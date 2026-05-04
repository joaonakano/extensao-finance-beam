import { useQuery } from "@tanstack/react-query"

export function useCategories(userId: number) {
  const { data, isLoading } = useQuery({
    queryKey: ["categories", userId],
    queryFn: async () => {
      const res = await window.api.categories.getAll(userId)
      // O IPC retorna ApiResponse<T[]> — extrair .data
      if (res && typeof res === "object" && "data" in res) return (res as any).data ?? []
      return res ?? []
    },
  })
  return { categories: (data as any[]) ?? [], isLoading }
}

export function usePaymentMethods(userId: number) {
  const { data, isLoading } = useQuery({
    queryKey: ["paymentMethods", userId],
    queryFn: async () => {
      const res = await window.api.paymentMethods.getAll(userId)
      // O IPC retorna ApiResponse<T[]> — extrair .data
      if (res && typeof res === "object" && "data" in res) return (res as any).data ?? []
      return res ?? []
    },
  })
  return { paymentMethods: (data as any[]) ?? [], isLoading }
}
