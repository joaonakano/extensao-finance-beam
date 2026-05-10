import { db } from "@main/db/db";
import { mapPaymentMethod } from "@main/mappers/payment-method.mapper";
import { PaymentMethodType } from "@shared/types";

export class PaymentMethodRepository {
    static getAll(userId: number) {
        const rows = db.
            prepare(`
                SELECT *
                FROM payment_methods
                WHERE user_id = ?
                ORDER BY created_at DESC
            `).all(userId)

        return rows.map(row =>
            mapPaymentMethod(row as any)
        )
    }

    static getById(id: number, userId: number) {
        const row = db.
            prepare(`
                SELECT *
                FROM payment_methods
                WHERE id = ?
                AND user_id = ?
            `).get(id, userId)

        if (!row) return null

        return mapPaymentMethod(row as any)
    }

    static create(
        userId: number,
        data: {
            name: string,
            type: PaymentMethodType,
        }
    ) {
        const result = db.
            prepare(`
                INSERT INTO payment_methods (
                    user_id,
                    name,
                    type
                )
                VALUES (?, ?, ?)
            `).run(
                userId,
                data.name,
                data.type
            )

        return Number(result.lastInsertRowid)
    }

    static update(
        userId: number,
        data: {
            id: number,
            name?: string,
            type?: PaymentMethodType,
            status?: 'ativo' | 'inativo'
        }
    ) {
        db.prepare(`
            UPDATE payment_methods
            SET
                name = COALESCE(?, name),
                type = COALESCE(?, type),
                status = COALESCE(?, status)
            WHERE id = ?
            AND user_id = ?
        `).run(
            data.name ?? null,
            data.type ?? null,
            data.status ?? null,
            data.id,
            userId
        )
    }

    static delete(
        id: number,
        userId: number
    ) {
        db.prepare(`
            DELETE FROM payment_methods
            WHERE id = ?
            AND user_id = ?
        `).run(id, userId)
    }
}