import { ipcMain } from "electron";

import { IPC_CHANNELS } from "@shared/ipc";
import { IPCResponse, Settlement } from "@shared/types";

import { requireAuth } from "./helpers/auth.helper";

import { SettlementRepository } from "@main/repositories/settlement.repository";

export function registerSettlementsHandlers() {
    ipcMain.handle(
        IPC_CHANNELS.SETTLEMENTS_GET_ALL,
        async (): Promise<IPCResponse<Settlement[]>> => {
            try {
                const auth = requireAuth()
                
                if ('success' in auth) {
                    return auth
                }

                const settlements = SettlementRepository.getAll(auth.id)

                return { 
                    success: true,
                    data: settlements,
                }
            } catch (err) {
                console.error('[IPC] settlements:getAll error:', err)

                return {
                    success: false,
                    error: 'Erro ao buscar quitações.',
                }
            }
        }
    )

    ipcMain.handle(
        IPC_CHANNELS.SETTLEMENTS_GET_BY_ID,
        async (_, id: number): Promise<IPCResponse<Settlement>> => {
            try {
                const auth = requireAuth()

                if ('success' in auth) {
                    return auth
                }

                const settlement = SettlementRepository.getById(
                    id,
                    auth.id
                )

                if (!settlement) {
                    return {
                        success: false,
                        error: 'Quitação não encontrada.'
                    }
                }

                return {
                    success: true,
                    data: settlement,
                }
            } catch (err) {
                console.error('[IPC] settlements:getById error:', err)

                return {
                    success: false,
                    error: 'Erro ao buscar quitação.',
                }
            }
        }
    )

    ipcMain.handle(
        IPC_CHANNELS.SETTLEMENTS_GET_BY_EXPENSE,
        async (_, expenseId: number): Promise<IPCResponse<Settlement[]>> => {
            try {
                const auth = requireAuth()

                if ('success' in auth) {
                    return auth
                }

                const settlements = SettlementRepository.getByExpense(
                    expenseId,
                    auth.id
                )

                return {
                    success: true,
                    data: settlements,
                }
            } catch (err) {
                console.error('[IPC] settlements:getByExpense error:', err)

                return {
                    success: false,
                    error: 'Erro ao buscar quitações.',
                }
            }
        }
    )

    ipcMain.handle(
        IPC_CHANNELS.SETTLEMENTS_CREATE,
        async (_, data): Promise<IPCResponse<Number>> => {
            try {
                const auth = requireAuth()

                if ('success' in auth) {
                    return auth
                }

                const settlementId = SettlementRepository.create(
                    auth.id,
                    data,
                )

                return {
                    success: true,
                    data: settlementId,
                }
            } catch (err) {
                console.error('[IPC] settlements:create error:', err)

                return {
                    success: false,
                    error: 'Erro ao criar quitação.',
                }
            }
        }
    )

    ipcMain.handle(
        IPC_CHANNELS.SETTLEMENTS_DELETE,
        async (_, id: number): Promise<IPCResponse<void>> => {
            try {
                const auth = requireAuth()

                if ('success' in auth) {
                    return auth
                }

                SettlementRepository.delete(
                    id,
                    auth.id
                )

                return {
                    success: true,
                    data: undefined,
                }
            } catch (err) {
                console.error('[IPC] settlements:delete error:', err)

                return {
                    success: false,
                    error: 'Erro ao excluir quitação',
                }
            }
        }
    )
}