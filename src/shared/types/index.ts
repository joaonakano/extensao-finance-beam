// Exportando arquivos específicos
export * from "./payment-method"
export * from "./settlement"

// Tipos globais
export type IPCResponse<T> = 
    | { success: true, data: T }
    | { success: false, error: string };