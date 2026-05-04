import { ipcMain } from "electron"
import { db } from "../db/db"
import { ApiResponse } from "./types"


export function registerAuthHandlers() {

    ipcMain.handle('auth:login', (_, email: string, senha: string): ApiResponse<any> => {
        try {
            const user = db.prepare(`
                SELECT *
                FROM users
                WHERE email = ? AND senha = ?
            `).get(email, senha) as any

            if (!user) {
                return { success: false, error: 'E-mail ou senha incorretos.' }
            }

            return {
                success: true,
                data: {
                    id: user.id,
                    nome: user.nome,
                    email: user.email
                }
            }
        } catch (err) {
            console.error('auth:login error', err)
            return { success: false, error: 'Erro interno ao fazer login.' }
        }
    })

    ipcMain.handle('auth:register', (_, nome: string, email: string, senha: string): ApiResponse<{ id: number}> => {
        try {
            const result = db.prepare(`
                INSERT INTO users (nome, email, senha)
                VALUES (?, ?, ?)
            `).run(nome, email, senha)

            const userId = Number(result.lastInsertRowid)

            // Criar categorias padrão para o novo usuário
            const defaultCategories = [
                ['Alimentação', '#f97316'],
                ['Transporte', '#3b82f6'],
                ['Lazer', '#8b5cf6'],
                ['Saúde', '#10b981'],
                ['Moradia', '#f59e0b'],
                ['Outros', '#6b7280'],
            ]

            for (const [name, color] of defaultCategories) {
                db.prepare(`
                    INSERT INTO categories (user_id, name, color)
                    VALUES (?, ?, ?)
                `).run(userId, name, color)
            }

            // Criar meios de pagamento padrão
            const defaultPayments = [
                ['Dinheiro', 'dinheiro'],
                ['Pix', 'pix'],
                ['Cartão de Crédito', 'cartao_credito'],
                ['Cartão de Débito', 'cartao_debito'],
            ]

            for (const [name, type] of defaultPayments) {
                db.prepare(`
                    INSERT INTO payment_methods (user_id, name, type)
                    VALUES (?, ?, ?)
                `).run(userId, name, type)
            }

            return {
                success: true,
                data: { id: userId }
            }

        } catch (err: any) {
            if (err.message?.includes('UNIQUE')) {
                return { success: false, error: 'Este e-mail já está cadastrado.' }
            }

            console.error('auth:register error', err)
            return { success: false, error: 'Erro ao criar conta.' }
        }
    })

    ipcMain.handle('auth:checkEmail', (_, email: string): ApiResponse<{ exists: boolean }> => {
        try {
            const user = db.prepare(`
                SELECT id
                FROM users
                WHERE email = ?
            `).get(email)

            return {
                success: true,
                data: { exists: !!user }
            }
        } catch (err) {
            console.error('auth:checkEmail error', err)
            return { success: false, error: 'Erro ao verificar e-mail.'}
        }
    })
}