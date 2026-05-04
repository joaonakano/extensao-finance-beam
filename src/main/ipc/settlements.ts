import { ipcMain } from "electron";
import { db } from "../db/db";
import { ApiResponse } from "./types";


export function registerSettlementsHandlers() {

    ipcMain.handle('settlements:getByExpense', (_, expenseId: number): ApiResponse<any[]> => {
        try {
            const data = db.prepare(`
                SELECT *
                FROM settlements
                WHERE expense_id = ?
                ORDER BY payment_date ASC
            `).all(expenseId)

            return { success: true, data }
        } catch (err) {
            console.error('settlements:getByExpense error', err)
            return { success: false, error: 'Erro ao buscar quitações.' }
        }
    })

    ipcMain.handle('settlements:create', (_, settlement: {
        expense_id: number
        amount_paid: number
        payment_date: string
    }): ApiResponse<{ id: number }> => {
        try {
            // Busca o total original e o total já pago
            const expense = db.prepare(`
                SELECT total
                FROM expenses
                WHERE id = ?
            `).get(settlement.expense_id) as any

            if (!expense) { 
                return { success: false, error: 'Despesa não encontrada.' }
            }


            const paidSoFar = (db.prepare(`
                SELECT COALESCE(SUM(amount_paid), 0) AS total
                FROM settlements
                WHERE expense_id = ?
            `).get(settlement.expense_id) as any).total

            const remaining = expense.total - paidSoFar

            if (settlement.amount_paid > remaining + 0.001) {
                return {
                    success: false,
                    error: `Valor superior ao saldo restante (R$ ${remaining.toFixed(2)}).`
                }
            }


            const result = db.prepare(`
                INSERT INTO settlements (expense_id, amount_paid, payment_date)
                VALUES (@expense_id, @amount_paid, @payment_date)
            `).run(settlement)

            // Se quita totalmente, marca a despesa como paga
            const newPaid = paidSoFar + settlement.amount_paid

            if (newPaid >= expense.total - 0.001) {
                db.prepare(`
                    UPDATE expenses
                    SET is_paid = 1
                    WHERE id = ?
                `).run(settlement.expense_id)
            }

            return {
                success: true,
                data: { id: Number(result.lastInsertRowid) }
            }
        } catch (err) {
            console.error('settlements:create error', err)
            return { success: false, error: 'Erro ao registrar quitação.' }
        }
    })
}