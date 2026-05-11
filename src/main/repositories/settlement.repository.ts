import { db } from "@main/db/db";
import { mapSettlement } from "@main/mappers/settlement.mapper";
import { CreateSettlementDTO } from "@shared/types";

export class SettlementRepository {
    static getAll(userId: number) {
        const rows = db.
            prepare(`
                SELECT *
                FROM settlements
                WHERE user_id = ?
                ORDER BY payment_date DESC
            `).all(userId)
        
        return rows.map(row =>
            mapSettlement(row as any)
        )
    }

    static getTotalPaidByExpense(expenseId: number, userId: number) {
        const result = db.
            prepare(`
                SELECT COALESCE(SUM(amount_paid), 0) as total
                FROM settlements
                WHERE expense_id = ?
                AND user_id = ?
            `).get(expenseId, userId) as { total: number }

        return result.total
    }

    static getByExpense(expenseId: number, userId: number) {
        const rows = db
            .prepare(`
                SELECT *
                FROM settlements
                WHERE expense_id = ?
                AND user_id = ?
                ORDER BY payment_date DESC
            `).all(expenseId, userId)

        return rows.map(row =>
            mapSettlement(row as any)
        )
    }

    static getById(id: number, userId: number) {
        const row = db.
            prepare(`
                SELECT *
                FROM settlements
                WHERE id = ?
                AND user_id = ?
            `).get(id, userId)

        if (!row) {
            return null
        }

        return mapSettlement(row as any)
    }

    static create(
        userId: number,
        data: CreateSettlementDTO
    ) {
        const result = db.
            prepare(`
                INSERT INTO settlements (
                    user_id,
                    expense_id,
                    amount_paid,
                    payment_date,
                    notes
                )
                VALUES (?, ?, ?, ?, ?)
            `).run(
                userId,
                data.expenseId,
                data.amountPaid,
                data.paymentDate,
                data.notes ?? null
            )
        
        return Number(result.lastInsertRowid)
    }

    static delete(
        id: number,
        userId: number
    ) {
        db.prepare(`
            DELETE FROM settlements
            WHERE id = ?
            AND user_id = ?
        `).run(id, userId)
    }
}