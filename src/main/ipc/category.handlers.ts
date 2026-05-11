import { ipcMain } from "electron"

import { IPC_CHANNELS } from "@shared/ipc"
import { Category, IPCResponse } from "@shared/types"

import { requireAuth } from "./helpers/auth.helper"

import { CategoryRepository } from "@main/repositories/category.repository"

export function registerCategoriesHandlers() {
    ipcMain.handle(
        IPC_CHANNELS.CATEGORIES_GET_ALL,
        async (): Promise<IPCResponse<Category[]>> => {
            try {
                const auth = requireAuth()

                if ('success' in auth) {
                    return auth
                }

                const categories = CategoryRepository.getAll(auth.id)

                return {
                    success: true,
                    data: categories,
                }
            } catch (err) {
                console.error('[IPC] categories:getAll error:', err)

                return {
                    success: false,
                    error: 'Erro ao buscar categorias.'
                }
            }
        }
    )

    ipcMain.handle(
        IPC_CHANNELS.CATEGORIES_CREATE,
        async (_, data): Promise<IPCResponse<number>> => {
            try {
                const auth = requireAuth()

                if ('success' in auth) {
                    return auth
                }

                const categoryId = CategoryRepository.create(
                    auth.id,
                    data
                )

                return {
                    success: true,
                    data: categoryId,
                }
            } catch (err) {
                console.error('[IPC] categories:create error:', err)

                return {
                    success: false,
                    error: 'Erro ao criar categoria.'
                }
            }
        }
    )

    ipcMain.handle(
        IPC_CHANNELS.CATEGORIES_UPDATE,
        async (_, data): Promise<IPCResponse<void>> => {
            try {
                const auth = requireAuth()

                if ('success' in auth) {
                    return auth
                }

                CategoryRepository.update(
                    auth.id,
                    data
                )

                return {
                    success: true,
                    data: undefined,
                }
            } catch (err) {
                console.error('[IPC] categories:update error:', err)

                return {
                    success: false,
                    error: 'Erro ao atualizar categoria.'
                }
            }
        }
    )

    ipcMain.handle(
        IPC_CHANNELS.CATEGORIES_DELETE,
        async (_, id): Promise<IPCResponse<void>> => {
            try {
                const auth = requireAuth()

                if ('success' in auth) {
                    return auth
                }

                CategoryRepository.delete(
                    id,
                    auth.id,
                )

                return {
                    success: true,
                    data: undefined,
                }
            } catch (err) {
                console.error('[IPC] categories:delete error:', err)

                return {
                    success: false,
                    error: 'Erro ao excluir categoria.',
                }
            }
        }
    )

}