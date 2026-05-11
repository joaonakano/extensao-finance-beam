import { ipcMain } from "electron";

import { IPC_CHANNELS } from "@shared/ipc";
import { IPCResponse, PaymentMethod } from "@shared/types";

import { requireAuth } from "./helpers/auth.helper";

import { PaymentMethodRepository } from "@main/repositories/payment-method.repository";

export function registerPaymentMethodsHandlers() {
    
    ipcMain.handle(
        IPC_CHANNELS.PAYMENT_METHODS_GET_ALL,
        async (): Promise<IPCResponse<PaymentMethod[]>> => {
            try {
                const auth = requireAuth()

                if ('success' in auth) {
                    return auth
                }
                
                const data = PaymentMethodRepository.getAll(auth.id)

                return {
                    success: true,
                    data,
                }
            } catch (err) {
                console.error("[IPC] getAll error:", err)

                return {
                    success: false,
                    error: 'Erro ao buscar meios de pagamento.',
                }
            }
        }
    )
    
    ipcMain.handle(
        IPC_CHANNELS.PAYMENT_METHODS_CREATE,
        async (_, data): Promise<IPCResponse<number>> => {
            try {
                const auth = requireAuth()

                if ('success' in auth) {
                    return auth
                }

                const id = PaymentMethodRepository.create(
                    auth.id,
                    data,
                )

                return {
                    success: true,
                    data: id,
                }
            } catch (err) {
                console.error("[IPC] getById error:", err)

                return {
                    success: false,
                    error: 'Erro ao criar método de pagamento.',
                }
            }
        }
    )

    ipcMain.handle(
        IPC_CHANNELS.PAYMENT_METHODS_UPDATE,
        async (_, data): Promise<IPCResponse<void>> => {
            try {
                const auth = requireAuth()

                if ('success' in auth) {
                    return auth
                }

                PaymentMethodRepository.update(
                    auth.id,
                    data
                )

                return {
                    success: true,
                    data: undefined,
                }
            } catch (err) {
                console.error("[IPC] update error:", err)

                return {
                    success: false,
                    error: 'Erro ao atualizar meio de pagamento.'
                }
            }
        }
    )

    ipcMain.handle(
        IPC_CHANNELS.PAYMENT_METHODS_DELETE,
        async (_, id): Promise<IPCResponse<void>> => {
            try {     
                const auth = requireAuth()
                
                if ('success' in auth) {
                    return auth
                }

                PaymentMethodRepository.delete(
                    id,
                    auth.id
                )

                return {
                    success: true,
                    data: undefined
                }
            } catch (err) {
                console.error("[IPC] delete error:", err)

                return {
                    success: false,
                    error: 'Erro ao excluir meio de pagamento.'
                }
            }
        }
    )

}