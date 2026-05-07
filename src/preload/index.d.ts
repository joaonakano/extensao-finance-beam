import { ElectronAPI } from '@electron-toolkit/preload'
import { CreateSettlementInput, IPCResponse, PaymentMethod } from '@shared/types'

export interface IApi {
  auth: {
    login: (email: string, senha: string) => Promise<any>,
    register: (nome: string, email: string, senha: string) => Promise<any>,
    checkEmail: (email: string) => Promise<{ exists: boolean }>,
  },
  expenses: {
    getAll: (userId: number) => Promise<any[]>,
    getChildrenByParent: (parentId: number) => Promise<any[]>,
    getById: (id: number) => Promise<any>,
    create: (expense: any) => Promise<any>,
    update: (expense: any) => Promise<any>,
    togglePaid: (id: number) => Promise<any>,
    delete: (id: number) => Promise<any>,
  },
  categories: {
    getAll: (userId: number) => Promise<any[]>,
    create: (category: any) => Promise<any>,
    delete: (id: number) => Promise<any>,
  },
  paymentMethods: {
    getAll: (userId: number) => Promise<IPCResponse<PaymentMethod[]>>,
    create: (paymentMethod: CreatePaymentMethodInput) => Promise<IPCResponse<number>>,
    update: (paymentMethod: PaymentMethod) => Promise<IPCResponse<null>>,
    delete: (id: number) => Promise<IPCResponse<null>>,
  },
  settlements: {
    getByExpenses: (expenseId: number) => IPCResponse<any[]>,
    create: (settlement: CreateSettlementInput) => IPCResponse<{ id: number }>,
  },
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: IApi
  }
}
