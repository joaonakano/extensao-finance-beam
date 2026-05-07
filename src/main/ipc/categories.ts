import { ipcMain } from "electron"
import { db } from "@main/db/db"
import { Category, CreateRequest, DeleteRequest, GetRequest, IPCResponse, UpdateRequest } from "@shared/types"

export function registerCategoriesHandlers() {

    ipcMain.handle('categories:getAll', async (_, request: GetRequest): Promise<IPCResponse<Category[]>> => {
        try {
            const data = db.prepare(`
                SELECT *
                FROM categories
                WHERE user_id = @user_id
                ORDER BY name ASC
            `).all(request) as Category[]

            return { success: true, data: data ?? [] }
        } catch (err) {
            console.error('[IPC] categories:getAll error:', err)
            return { success: false, error: 'Erro ao buscar categorias.' }
        }
    })

    ipcMain.handle('categories:create', async (_, request: CreateRequest<Category>): Promise<IPCResponse<number>> => {
        try {
            const result = db.prepare(`
                INSERT INTO categories (user_id, name, color, status)
                VALUES (@user_id, @name, @color, @status)
            `).run(request)

            return { success: true, data: Number(result.lastInsertRowid) }
        } catch (err) {
            console.error('[IPC] categories:create error:', err)
            return { success: false, error: 'Erro ao criar categoria.' }
        }
    })

    ipcMain.handle('categories:update', async (_, request: UpdateRequest<Category>): Promise<IPCResponse<null>> => {
        try {
            const result = db.prepare(`
                UPDATE categories
                SET name = @name,
                    color = @color,
                    status = @status
                WHERE id = @id AND user_id = @user_id
            `).run(request)
            
            if (result.changes === 0) {
                return { success: false, error: 'Categoria não encontrada.' }
            }

            return { success: true, data: null }
        } catch (err) {
            console.error('[IPC] categories:update error:', err)
            return { success: false, error: 'Erro ao atualizar categoria.'}
        }
    })

    ipcMain.handle('categories:delete', async (_, request: DeleteRequest): Promise<IPCResponse<null>> => {
        try {
            const result = db.prepare(`
                UPDATE categories
                SET status = 'inativo'
                WHERE id = @id AND user_id = @user_id
            `).run(request)

            if (result.changes === 0) {
                return { success: false, error: 'Categoria não encontrada ou já inativa.' }
            }

            return { success: true, data: null }
        } catch (err) {
            console.error('[IPC] categories:delete error:', err)
            return { success: false, error: 'Erro ao excluir categoria.' }
        }
    })

}