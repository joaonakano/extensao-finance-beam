import { ipcMain } from "electron";
import { db } from "../db/db";
import { ApiResponse } from "./types";

export function registerPaymentMethodsHandlers() {
    
    ipcMain.handle('paymentMethods:getAll', async (_, userId: number): Promise<ApiResponse<any[]>> => {
        try {
            const data = db.prepare(`
                SELECT *
                FROM payment_methods
                WHERE user_id = ?
                ORDER BY name ASC
            `).all(userId)

            // console.log("[IPC] getAll data:", data)
            return { success: true, data }
        } catch (err) {
            console.error("[IPC] getAll erro:", err)
            return { success: false, error: 'Erro ao buscar meios de pagamento.' }
        }
    })

    ipcMain.handle('paymentMethods:create', (_, pm: any) => {
        try {
            // console.log("pm recebido:", pm)

            const result = db.prepare(`
                INSERT INTO payment_methods (user_id, name, type)
                VALUES (@user_id, @name, @type)
            `).run(pm)

            return {
                success: true,
                data: { id: Number(result.lastInsertRowid) }
            }
        } catch (err) {
            console.error("CREATE FATAL ERROR:", err)
            return { success: false, error: 'Erro ao criar meio de pagamento (2 teste se isso nao aparecer quer dizer que e uma mensagem antiga).' }
        }
    })

    ipcMain.handle('paymentMethods:update', (_, pm: any): ApiResponse<null> => {
        try {
            const result = db.prepare(`
                UPDATE payment_methods
                SET name = @name,
                    type = @type,
                    status = @status
                WHERE id = @id
            `).run(pm)

            if (result.changes === 0) {
                return { success: false, error: 'Meio de pagamento não encontrado.' }
            }

            return { success: true, data: null }
        } catch (err) {
            console.error(err)
            return { success: false, error: 'Erro ao atualizar meio de pagamento.'}
        }
    })

    ipcMain.handle('paymentMethods:delete', (_, id: number): ApiResponse<null> => {
        try {
            console.log("[IPC] delete chamado com id:", id, "tipo:", typeof id)
            
            const result = db.prepare(`
                UPDATE payment_methods
                SET status = 'inativo'
                WHERE id = ?
            `).run(id)

            if (result.changes === 0) {
                return { success: false, error: 'Meio de pagamento não encontrado.' }
            }
            
            console.log("[IPC] delete chamado com id:", id, "tipo:", typeof id)

            return { success: true, data: null }
        } catch (err) {
            console.error(err)
            return { success: false, error: 'Erro ao excluir meio de pagamento.'}
        }
    })

}