import { ipcMain } from "electron";
import { db } from "../database/db";
import { ApiResponse } from "./types";

export function registerPaymentMethodsHandlers() {
    
    ipcMain.handle('paymentMethods:getAll', (_, userId: number): ApiResponse<any[]> => {
        try {
            const data = db.prepare(`
                SELECT *
                FROM payment_methods
                WHERE user_id = ?
                AND status = 'ativo'
                ORDER BY name ASC
            `).all(userId)

            return { success: true, data }
        } catch (err) {
            console.error(err)
            return { success: false, error: 'Erro ao buscar meios de pagamento.' }
        }
    })

    ipcMain.handle('paymentMethods:create', (_, pm: any): ApiResponse<{ id: number }> => {
        try {
            const result = db.prepare(`
                INSERT INTO payment_methods (user_id, name, type)
                VALUES (@user_id, @name, @type)
            `).run(pm)

            return {
                success: true,
                data: { id: Number(result.lastInsertRowid) }
            }
        } catch (err) {
            console.error(err)
            return { success: false, error: 'Erro ao criar meio de pagamento.' }
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
            const result = db.prepare(`
                UPDATE payment_methods
                SET status = 'inativo'
                WHERE id = ?
            `).run(id)

            if (result.changes === 0) {
                return { success: false, error: 'Meio de pagamento não encontrado.' }
            }

            return { success: true, data: null }
        } catch (err) {
            console.error(err)
            return { success: false, error: 'Erro ao excluir meio de pagamento.'}
        }
    })

}