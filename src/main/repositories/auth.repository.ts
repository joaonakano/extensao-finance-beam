import { db } from "@main/db/db";
import { mapUser } from "@main/mappers/user.mapper";

import type { RegisterDTO } from "@shared/types";

export class AuthRepository {
    static findByEmail(email: string) {
        const row = db
            .prepare(`
                SELECT *
                FROM users
                WHERE email = ?
            `).get(email)

        if (!row) {
            return null
        }

        return mapUser(row as any)
    }

    static findById(id: number) {
        const row = db
            .prepare(`
                SELECT *
                FROM users
                WHERE id = ?    
            `).get(id)

        if (!row) {
            return null
        }

        return mapUser(row as any)
    }

    static create(data: RegisterDTO) {
        const result = db
            .prepare(`
                INSERT INTO users (
                    user_type_id,
                    name,
                    email,
                    password
                )
                VALUES (?, ?, ?, ?)    
            `).run(
                3,  // funcionario inicialmente, depois arrumamos
                data.name,
                data.email,
                data.password
            )

        return Number(result.lastInsertRowid)
    }
}