// src/env.d.ts

export interface IApi {
    auth: {
        login: (email: string, senha: string) => Promise<any>
        register: (nome: string, email: string, senha: string) => Promise<any>
        checkEmail: (email: string) => Promise<{ exists: boolean }>
    },
    expenses: {
        getAll: (userId: number) => Promise<any[]>
        getChildren: (userId: number) => Promise<any[]>
        getById: (id: number) => Promise<any[]>
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
        getAll: (userId: number) => Promise<any[]>
        create: (paymentMethod: any) => Promise<any>
        delete: (id: number) => Promise<any>
    }
}

declare global {
  interface Window {
    api: IApi
    ipcRenderer: any
  }
}

export {}