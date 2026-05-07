import { ipcMain } from "electron";
import { db } from "@main/db/db";

import { CreateRequest, Expense, GetByIdRequest, IPCResponse, Settlement } from "@shared/types";

export function registerSettlementsHandlers() {

    ipcMain.handle('settlements:getByExpense', async (_, request: GetByIdRequest): Promise<IPCResponse<Settlement[]>> => {
        try {
            if (!request.id || typeof request.id !== 'number') {
                return { success: false, error: 'ID da despesa inválido.' };
            }

            const data = db.prepare(`
                SELECT *
                FROM settlements
                WHERE expense_id = @id AND user_id = @user_id
                ORDER BY payment_date ASC
            `).all(request) as Settlement[]

            return { success: true, data: data ?? [] }
        } catch (err) {
            console.error('[IPC] getByExpense error:', err)
            return { success: false, error: 'Erro ao buscar quitações.' }
        }
    })

    ipcMain.handle('settlements:create', async (_, request: CreateRequest<Settlement>): Promise<IPCResponse<number>> => {

        const createSettlementTx = db.transaction((data: CreateRequest<Settlement>) => {
            const expense = db.prepare(`
                SELECT amount
                FROM expenses
                WHERE id = @expense_id AND user_id = @user_id
            `).get(data) as Pick<Expense, 'amount'> | undefined

            if (!expense) {
                throw new Error('Despesa não encontrada.');
            }

            const resultPaid = db.prepare(`
                SELECT COALESCE(SUM(amount_paid), 0) AS amount
                FROM settlements
                WHERE expense_id = @expense_id AND user_id = @user_id
            `).get(data) as { amount: number }

            const paidSoFar = resultPaid.amount
            const remaining = expense.amount - paidSoFar

            if (data.amount_paid > remaining + 0.01) {
                throw new Error(`Valor superior ao saldo restante (Saldo: R$ ${remaining.toFixed(2)}).`);
            }

            const insert = db.prepare(`
                INSERT INTO settlements (expense_id, amount_paid, payment_date)
                VALUES (@expense_id, @amount_paid, @payment_date)    
            `).run(data)

            const totalAfterThis = paidSoFar + data.amount_paid
            if (totalAfterThis >= expense.amount - 0.01) {
                db.prepare(`
                    UPDATE expenses
                    SET is_paid = 1
                    WHERE id = @expense_id AND user_id = @user_id
                `).run(data)
            }

            return Number(insert.lastInsertRowid)
        })
        
        try {
            const newId = createSettlementTx(request)
            return { success: true, data: newId }
        } catch (err) {
            console.error('[IPC] create error:', err)
            return { success: false, error: 'Erro ao registrar quitação.' }
        }
    })
}