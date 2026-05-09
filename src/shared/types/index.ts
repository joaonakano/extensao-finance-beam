// Padrão de resposta do banco para o React
export type IpcResponse<T> = 
    | { success: true, data: T }
    | { success: false, error: string };

// Tipos Utilitários
export type CreateResponse = IpcResponse<{ id: number }>;

export * from "./auth"
// export * from "./expenses"
// export * from "./settings"