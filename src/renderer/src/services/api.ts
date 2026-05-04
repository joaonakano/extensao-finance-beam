// src/services/api.ts
import { ApiResponse } from "@main/ipc/types"

export async function handleApi<T>(promise: Promise<ApiResponse<T> | T>): Promise<T> {
    const response = await promise

    // Se vier com wrapper { success, data }
    if (response !== null && typeof response === 'object' && 'success' in response) {
        const apiResponse = response as ApiResponse<T>
        if (!apiResponse.success) throw new Error(apiResponse.error)
        return apiResponse.data
    }

    // Se vier o dado direto (array ou objeto)
    return response as T
}