import { db } from "@main/db/db";
import { mapCategory } from "@main/mappers/category.mapper";
import { CreateCategoryDTO, UpdateCategoryDTO } from "@shared/types";

export class CategoryRepository {
    static getAll(userId: number) {
        const rows = db
            .prepare(`
                SELECT *
                FROM categories
                WHERE user_id = ?
                ORDER BY created_at DESC
            `).all(userId)

        return rows.map(row =>
            mapCategory(row as any)
        )
    }

    static getById(
        id: number,
        userId: number,
    ) {
        const row = db.
            prepare(`
                SELECT *
                FROM categories
                WHERE id = ?
                AND user_id = ?
            `).get(id, userId)

        if (!row) {
            return null
        }

        return mapCategory(row as any)
    }

    static create(
        userId: number,
        data: CreateCategoryDTO
    ) {
        const result = db.
            prepare(`
                INSERT INTO categories (
                    user_id
                    name,
                    color,
                    icon
                )
                VALUES (?, ?, ?, ?)
            `).run(
                userId,
                data.name,
                data.color ?? '#808080',
                data.icon ?? null
            )
        
        return Number(result.lastInsertRowid)
    }

    static update(
        userId: number,
        data: UpdateCategoryDTO
    ) {
        db.prepare(`
            UPDATE categories
            SET
                name = COALESCE(?, name)
                color = COALESCE(?, color)
                icon = COALESCE(?, icon)
                status = COALESCE(?, status)
            WHERE id = ?
            AND user_id = ?    
        `).run(
            data.name ?? null,
            data.color ?? null,
            data.icon ?? null,
            data.status ?? null,
            data.id,
            userId
        )
    }

    static delete(
        id: number,
        userId: number,
    ) {
        db.prepare(`
            DELETE FROM categories
            WHERE id = ?
            AND user_id = ?
        `).run(id, userId)
    }
}