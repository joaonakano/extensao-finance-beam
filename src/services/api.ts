
export async function handleApi<T>(promise: Promise<any>): Promise<T> {
    const res = await promise

    if (!res.success) {
        throw new Error(res.error || "Erro desconhecido")
    }

    return res.data
}