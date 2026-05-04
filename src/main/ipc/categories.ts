import { ipcMain } from "electron"
import { db } from "../db/db"
import { ApiResponse } from "./types"

export function registerCategoriesHandlers() {

    ipcMain.handle('categories:getAll', (_, userId: number): ApiResponse<any[]> => {
        try {
            const data = db.prepare(`
                SELECT *
                FROM categories
                WHERE user_id = ?
                AND status = 'ativo'
                ORDER BY name ASC
            `).all(userId)

            return { success: true, data }
        } catch (err) {
            console.error(err)
            return { success: false, error: 'Erro ao buscar categorias.' }
        }
    })

    ipcMain.handle('categories:create', (_, category: any): ApiResponse<{ id: number }> => {
        try {
            const result = db.prepare(`
                INSERT INTO categories (user_id, name, color)
                VALUES (@user_id, @name, @color)
            `).run(category)

            return {
                success: true,
                data: { id: Number(result.lastInsertRowid) }
            }
        } catch (err) {
            console.error(err)
            return { success: false, error: 'Erro ao criar categoria.' }
        }
    })

    ipcMain.handle('categories:update', (_, category: any): ApiResponse<null> => {
        try {
            const result = db.prepare(`
                UPDATE categories
                SET name = @name,
                    color = @color,
                    status = @status
                WHERE id = @id
            `).run(category)
            
            if (result.changes === 0) {
                return { success: false, error: 'Categoria não encontrada.' }
            }

            return { success: true, data: null }
        } catch (err) {
            console.error(err)
            return { success: false, error: 'Erro ao atualizar categoria.'}
        }
    })

    ipcMain.handle('categories:delete', (_, id: number): ApiResponse<null> => {
        try {
            const result = db.prepare(`
                UPDATE categories
                SET status = 'inativo'
                WHERE id = ?
            `).run(id)

            if (result.changes === 0) {
                return { success: false, error: 'Categoria não encontrada ou já inativa.' }
            }

            return { success: true, data: null }
        } catch (err) {
            console.error(err)
            return { success: false, error: 'Erro ao excluir categoria.' }
        }
    })

}