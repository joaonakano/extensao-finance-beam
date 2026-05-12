import { CreateExpenseDTO, Expense, UpdateExpenseDTO } from "@/env";
import { handleApi } from "@/services/api";

export const expensesApi = {
    /**
     * Método GET para obter todos os gastos registrados.
     * @returns Promise<Expense[]>
     */
    getAll: async (): Promise<Expense[]> => {
        return handleApi(window.api.expenses.getAll())
    },

    /**
     * 
     * @param id Método GET para obter um gasto com o id informado.
     * @returns Promise<Expense | null>
     */
    getById: async (id: number): Promise<Expense | null> => {
        return handleApi(window.api.expenses.getById(id))
    },

    /**
     * 
     * @param parentId Método GET para obter todos os gastos afiliados ou que possuam relação hierárquica. 
     * @returns Promise<Expense[]>
     */
    getChildren: async (parentId: number): Promise<Expense[]> => {
        return handleApi(window.api.expenses.getChildren(parentId))
    },

    /**
     * 
     * @param data Método POST para criar novos gastos.
     * @returns Promise<number>
     */
    create: async (data: CreateExpenseDTO): Promise<number> => {
        return handleApi(window.api.expenses.create(data))
    },

    /**
     * 
     * @param data Método PUT para atualizar um gasto com novas informações.
     * @returns Promise<void>
     */
    update: async (data: UpdateExpenseDTO): Promise<void> => {
        return handleApi(window.api.expenses.update(data))
    },

    /**
     * 
     * @param id Método DELETE para remover um gasto.
     * @returns Promise<void>
     */
    delete: async (id: number): Promise<void> => {
        return handleApi(window.api.expenses.delete(id))
    },
}