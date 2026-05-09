// Padrão de resposta do banco para o React
export type IPCResponse<T> =
    | { success: true, data: T }
    | { success: false, error: string }