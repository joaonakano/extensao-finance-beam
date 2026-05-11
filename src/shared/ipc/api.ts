import type {
    IPCResponse,

    User,
    Category,
    PaymentMethod,
    Expense,
    Settlement,

    CreateCategoryDTO,
    UpdateCategoryDTO,

    CreateExpenseDTO,
    UpdateExpenseDTO,

    CreateSettlementDTO,

    LoginDTO,
    RegisterDTO,
} from '@shared/types'

export interface Api {
    auth: {
        login(
            data: LoginDTO
        ): Promise<IPCResponse<User>>

        register(
            data: RegisterDTO
        ): Promise<IPCResponse<User>>

        logout(): Promise<IPCResponse<void>>

        me(): Promise<IPCResponse<User | null>>
    }

    categories: {
        getAll(): Promise<IPCResponse<Category[]>>

        getById(
            id: number
        ): Promise<IPCResponse<Category>>

        create(
            data: CreateCategoryDTO
        ): Promise<IPCResponse<number>>

        update(
            data: UpdateCategoryDTO
        ): Promise<IPCResponse<void>>

        delete(
            id: number
        ): Promise<IPCResponse<void>>
    }

    paymentMethods: {
        getAll(): Promise<IPCResponse<PaymentMethod[]>>

        getById(
            id: number
        ): Promise<IPCResponse<PaymentMethod>>

        create(
            data: Omit<PaymentMethod, 'id' | 'userId' | 'createdAt'>
        ): Promise<IPCResponse<number>>

        update(
            data: Partial<PaymentMethod> & { id: number }
        ): Promise<IPCResponse<void>>

        delete(
            id: number
        ): Promise<IPCResponse<void>>
    }

    expenses: {
        getAll(): Promise<IPCResponse<Expense[]>>

        getById(
            id: number
        ): Promise<IPCResponse<Expense>>

        getChildren(
            parentId: number
        ): Promise<IPCResponse<Expense[]>>

        create(
            data: CreateExpenseDTO
        ): Promise<IPCResponse<number>>

        update(
            data: UpdateExpenseDTO
        ): Promise<IPCResponse<void>>

        delete(
            id: number
        ): Promise<IPCResponse<void>>
    }

    settlements: {
        getAll: () => Promise<IPCResponse<Settlement[]>>

        getById: (id: number) => Promise<IPCResponse<Settlement>>

        getByExpense(
            expenseId: number
        ): Promise<IPCResponse<Settlement[]>>

        create(
            data: CreateSettlementDTO
        ): Promise<IPCResponse<number>>

        delete: (id: number) => Promise<IPCResponse<void>>
    }
}