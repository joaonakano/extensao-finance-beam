// Exportando arquivos específicos
export * from "./payment-method"
export * from "./settlement"
export * from "./expense"
export * from "./category"

// Tipos globais
export type IPCResponse<T> = 
    | { success: true, data: T }
    | { success: false, error: string };

export interface DeleteRequest {
  id: number,
  user_id: number,
}

export interface GetByIdRequest {
    id: number,
    user_id: number,
}

export type CreateRequest<T> = Omit<T, 'id'>

export interface GetRequest {
    user_id: number,
}

export type UpdateRequest<T> = Partial<T> & { id: number; user_id: number };