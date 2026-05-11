/// <reference types="vite/client" />

// Re-exporta os tipos compartilhados para uso no renderer
export type { Api } from '../../shared/ipc/api'
export type {
  User, Category, PaymentMethod, Expense, Settlement,
  CreateExpenseDTO, UpdateExpenseDTO, CreateSettlementDTO,
  LoginDTO, RegisterDTO, CreateCategoryDTO, UpdateCategoryDTO,
} from '../../shared/types'
export type { IPCResponse } from '../../shared/types/base/ipc-response'
export type { ExpenseStatus } from '../../shared/types/base/expense-status'

declare global {
  interface Window {
    api: import('../../shared/ipc/api').Api
    electron: any
  }
}
