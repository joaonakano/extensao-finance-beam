import { db } from "@main/db/db";
import { mapExpense } from "@main/mappers/expense.mapper";
import { CreateExpenseDTO, UpdateExpenseDTO } from "@shared/types";

export class ExpenseRepository {
    static getAll(userId: number) {
        const rows = db.
            prepare(`
                SELECT *
                FROM expenses
                WHERE user_id = ?
                ORDER BY created_at DESC
            `).all(userId)

        return rows.map(row =>
            mapExpense(row as any)
        )
    }

    static getById(
        id: number,
        userId: number,
    ) {
        const row = db.
            prepare(`
                SELECT *
                FROM expenses
                WHERE id = ?
                AND user_id = ?
            `).get(id, userId)

        if (!row) {
            return null
        }

        return mapExpense(row as any)
    }

    static updateStatus(
        expenseId: number,
        userId: number,
        status: string
    ) {
        db.prepare(`
            UPDATE expenses
            SET status = ?
            WHERE id = ?
            AND user_id = ?
        `).run(status, expenseId, userId)
    }

    static getChildren(
        parentId: number,
        userId: number,
    ) {
        const rows = db.
            prepare(`
                SELECT *
                FROM expenses
                WHERE parent_id = ?
                AND user_id = ?
                ORDER BY created_at ASC
            `).all(parentId, userId)

        return rows.map(row =>
            mapExpense(row as any)
        )
    }

    static create(
        userId: number,
        data: CreateExpenseDTO,
    ) {
        const result = db.
            prepare(`
                INSERT INTO expenses (
                    user_id,
                    parent_id,
                    category_id,
                    payment_method_id,
                    description,
                    amount,
                    due_date,
                    is_group,
                    notes
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                userId,

                data.parentId ?? null,

                data.categoryId ?? null,
                data.paymentMethodId ?? null,

                data.description,

                data.amount,

                data.dueDate ?? null,
                
                data.isGroup ?? 0,

                data.notes ?? null
            )

        return Number(result.lastInsertRowid)
    }

    static update(
        userId: number,
        data: UpdateExpenseDTO
    ) {
        db.prepare(`
            UPDATE expenses
            SET
                category_id = COALESCE(?, category_id),
                payment_method_id = COALESCE(?, payment_method_id),
                description = COALESCE(?, description),
                amount = COALESCE(?, amount),
                due_date = COALESCE(?, due_date),
                status = COALESCE(?, status),
                notes = COALESCE(?, notes)
            WHERE id = ?
            AND user_id = ?
        `).run(
            data.categoryId ?? null,
            data.paymentMethodId ?? null,

            data.description ?? null,

            data.amount ?? null,

            data.dueDate ?? null,

            data.status ?? null,

            data.notes ?? null,

            data.id,
            userId
        )
    }

    static delete(
        id: number,
        userId: number
    ) {
        db.prepare(`
            DELETE FROM expenses
            WHERE id = ?
            AND user_id = ?
        `).run(id, userId)
    }
}