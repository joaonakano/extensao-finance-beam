import { ElectronAPI } from '@electron-toolkit/preload'
import { Category, CreateRequest, DeleteRequest, GetByIdRequest, GetRequest, IPCResponse, PaymentMethod, Settlement, UpdateRequest } from '@shared/types'

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
    getAll: (request: GetRequest) => Promise<IPCResponse<Category[]>>,
    create: (request: CreateRequest<Category>) => Promise<IPCResponse<number>>,
    update: (request: UpdateRequest<Category>) => Promise<IPCResponse<null>>
    delete: (request: DeleteRequest) => Promise<IPCResponse<null>>,
  },
  paymentMethods: {
    getAll: (request: GetRequest) => Promise<IPCResponse<PaymentMethod[]>>,
    getById: (request: GetByIdRequest) => Promise<IPCResponse<PaymentMethod>>,
    create: (request: CreateRequest<PaymentMethod>) => Promise<IPCResponse<number>>,
    update: (request: UpdateRequest<PaymentMethod>) => Promise<IPCResponse<null>>,
    delete: (request: DeleteRequest) => Promise<IPCResponse<null>>,
  },
  settlements: {
    getByExpenses: (request: GetByIdRequest) => Promise<IPCResponse<Settlement[]>>,
    create: (request: CreateRequest<Settlement>) => Promise<IPCResponse<number>>,
  },
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: IApi
  }
}
