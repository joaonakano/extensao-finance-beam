/// <reference types="vite/client" />

import { ApiResponse } from "./main/ipc/types"

export interface IApi {
    auth: {
        login: (email: string, senha: string) => Promise<any>
        register: (nome: string, email: string, senha: string) => Promise<any>
        checkEmail: (email: string) => Promise<{ exists: boolean }>
    },
    expenses: {
        getAll: (userId: number) => Promise<any[]>
        getChildrenByParent: (parentId: number) => Promise<any[]>
        getById: (id: number) => Promise<any>
        create: (expense: any) => Promise<any>
        update: (expense: any) => Promise<any>
        togglePaid: (id: number) => Promise<any>
        delete: (id: number) => Promise<any>
    },
    categories: {
        getAll: (userId: number) => Promise<any[]>
        create: (category: any) => Promise<any>
        delete: (id: number) => Promise<any>
    },
    paymentMethods: {
        getAll: (userId: number) => Promise<ApiResponse<any[]>>
        create: (paymentMethod: any) => Promise<ApiResponse<{ id: number }>>
        update: (paymentMethod: any) => Promise<ApiResponse<null>>
        delete: (id: number) => Promise<ApiResponse<null>>
    },
    settlements: {
        getByExpense: (expenseId: number) => Promise<any[]>
        create: (settlement: { expense_id: number; amount_paid: number; payment_date: string }) => Promise<any>
    }
}

declare global {
  interface Window {
    api: IApi
    ipcRenderer: any
  }
}

export {}