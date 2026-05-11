import { ipcMain } from "electron";

import { IPC_CHANNELS } from "@shared/ipc";
import { Expense, IPCResponse } from "@shared/types";
import { requireAuth } from "./helpers/auth.helper";
import { ExpenseRepository } from "@main/repositories/expense.repository";

export function registerExpensesHandlers() {
    ipcMain.handle(
        IPC_CHANNELS.EXPENSES_GET_ALL,
        async (): Promise<IPCResponse<Expense[]>> => {
            try {
                const auth = requireAuth()

                if ('success' in auth) {
                    return auth
                }

                const expenses = ExpenseRepository.getAll(auth.id)
            
                return {
                    success: true,
                    data: expenses,
                }
            } catch (err) {
                console.error('[IPC] expenses:getAll error:', err)

                return {
                    success: false,
                    error: 'Erro ao buscar despesas.'
                }
            }
        }
    )

    ipcMain.handle(
        IPC_CHANNELS.EXPENSES_GET_BY_ID,
        async (_, id: number): Promise<IPCResponse<Expense>> => {
            try {
                const auth = requireAuth()

                if ('success' in auth) {
                    return auth
                }

                const expense = ExpenseRepository.getById(
                    id,
                    auth.id,
                )

                if (!expense) {
                    return {
                        success: false,
                        error: 'Despesa não encontrada',
                    }
                }

                return {
                    success: true,
                    data: expense,
                }
            } catch (err) {
                console.error('[IPC] expenses:getChildrenByParent error:', err)

                return {
                    success: false,
                    error: 'Erro ao buscar despesa.'
                }
            }
        }
    )

    ipcMain.handle(
        IPC_CHANNELS.EXPENSES_GET_CHILDREN,
        async (_, parentId: number): Promise<IPCResponse<Expense[]>> => {
            try {
                const auth = requireAuth()

                if ('success' in auth) {
                    return auth
                }

                const expenses = ExpenseRepository.getChildren(
                    parentId,
                    auth.id,
                )

                return {
                    success: true,
                    data: expenses
                }
            } catch (err) {
                console.error('[IPC] expenses:getById error:', err)

                return {
                    success: false,
                    error: 'Erro ao buscar despesa.'
                }
            }
        }
    )

    ipcMain.handle(
        IPC_CHANNELS.EXPENSES_CREATE,
        async (_, data): Promise<IPCResponse<Number>> => {
            try {
                const auth = requireAuth()

                if ('success' in auth) {
                    return auth
                }
                
                const expenseId = ExpenseRepository.create(
                    auth.id,
                    data,
                )

                return {
                    success: true,
                    data: expenseId,
                }
            } catch (err) {
                console.error('[IPC] expenses:create error:', err)

                return {
                    success: false,
                    error: 'Erro ao criar despesa.'
                }
            }
        }
    )

    ipcMain.handle(
        IPC_CHANNELS.EXPENSES_UPDATE,
        async (_, data): Promise<IPCResponse<void>> => {
            try {
                const auth = requireAuth()

                if ('success' in auth) {
                    return auth
                }

                ExpenseRepository.update(
                    auth.id,
                    data,
                )

                return {
                    success: true,
                    data: undefined,
                }
            } catch (err) {
                console.error('[IPC] expenses:update error:', err)

                return {
                    success: false,
                    error: 'Erro ao atualizar despesa.',
                }
            }
        }
    )

    ipcMain.handle(
        IPC_CHANNELS.EXPENSES_DELETE,
        async (_, id: number): Promise<IPCResponse<void>> => {
            try {
                const auth = requireAuth()

                if ('success' in auth) {
                    return auth
                }

                ExpenseRepository.delete(
                    id,
                    auth.id,
                )

                return {
                    success: true,
                    data: undefined,
                }
            } catch (err) {
                console.error('[IPC] expenses:delete error:', err)

                return {
                    success: false,
                    error: 'Erro ao excluir despesa.',
                }
            }
        }
    )
}