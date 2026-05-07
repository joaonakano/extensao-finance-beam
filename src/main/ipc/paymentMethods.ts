import { ipcMain } from "electron";
import { db } from "@main/db/db";
import { CreateRequest, DeleteRequest, GetByIdRequest, GetRequest, IPCResponse, PaymentMethod, UpdateRequest } from "@shared/types"

export function registerPaymentMethodsHandlers() {
    
    ipcMain.handle('paymentMethods:getAll', async (_, request: GetRequest): Promise<IPCResponse<PaymentMethod[]>> => {
        try {
            const data = db.prepare(`
                SELECT *
                FROM payment_methods
                WHERE user_id = @user_id
                ORDER BY name ASC
            `).all(request) as PaymentMethod[]

            return { success: true, data: data ?? [] }
        } catch (err) {
            console.error("[IPC] getAll error:", err)
            return { success: false, error: 'Erro ao buscar meios de pagamento.' }
        }
    })
    
    ipcMain.handle('paymentMethods:getById', async (_, request: GetByIdRequest): Promise<IPCResponse<PaymentMethod>> => {
        try {
            const data = db.prepare(`
                SELECT *
                FROM payment_methods
                WHERE id = @id AND user_id = @user_id
            `).get(request) as PaymentMethod | undefined;

            if (!data) {
                return { success: false, error: 'Meio de pagamento não encontrado.'}
            }

            return { success: true, data }
        } catch (err) {
            console.error("[IPC] getById error:", err)
            return { success: false, error: 'Erro ao buscar o meio de pagamento.' }
        }
    })

    ipcMain.handle('paymentMethods:create', async (_, request: CreateRequest<PaymentMethod>): Promise<IPCResponse<number>> => {
        try {
            const result = db.prepare(`
                INSERT INTO payment_methods (user_id, name, type, status)
                VALUES (@user_id, @name, @type, @status)
            `).run(request)

            return { success: true, data: Number(result.lastInsertRowid) }
        } catch (err) {
            console.error("[IPC] create error:", err)
            return { success: false, error: 'Erro ao criar meio de pagamento.' }
        }
    })

    ipcMain.handle('paymentMethods:update', async (_, request: UpdateRequest<PaymentMethod>): Promise<IPCResponse<null>> => {
        try {
            const result = db.prepare(`
                UPDATE payment_methods
                SET name = @name,
                    type = @type,
                    status = @status
                WHERE id = @id AND user_id = @user_id
            `).run(request)

            if (result.changes === 0) {
                return { success: false, error: 'Meio de pagamento não encontrado.' }
            }

            return { success: true, data: null }
        } catch (err) {
            console.error("[IPC] update error:", err)
            return { success: false, error: 'Erro ao atualizar meio de pagamento.'}
        }
    })

    ipcMain.handle('paymentMethods:delete', async (_, request: DeleteRequest): Promise<IPCResponse<null>> => {
        try {           
            const result = db.prepare(`
                UPDATE payment_methods
                SET status = 'inativo'
                WHERE id = @id AND user_id = @user_id
            `).run(request)

            if (result.changes === 0) {
                return { success: false, error: 'Meio de pagamento não encontrado.' }
            }

            return { success: true, data: null }
        } catch (err) {
            console.error("[IPC] delete error:", err)
            return { success: false, error: 'Erro ao excluir meio de pagamento.'}
        }
    })

}