import { ipcMain, app } from 'electron'
import { createRequire } from 'node:module'
import path from 'path'


const require = createRequire(import.meta.url)
const Database = require('better-sqlite3')


// Entidades
interface Gasto {
    id?: number
    descricao: string
    total: number
    categoria: string
    data: string
    pago?: number
    user_id?: number
}

interface User {
    id?: number
    nome: string
    email: string
    senha: string
    created_at?: string
}

interface LoginRequest {
    email: string
    senha: string
}

interface RegisterRequest {
    nome: string
    email: string
    senha: string
}

let db: ReturnType<typeof Database>

// Setup
function setupDatabase() {
    // Tabela dos Users
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            senha TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now'))
        )
    `)

    // Tabela de gastos com aforeign key
    db.exec(`
        CREATE TABLE IF NOT EXISTS gastos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            descricao TEXT NOT NULL,
            total REAL NOT NULL,
            categoria TEXT NOT NULL,
            data TEXT NOT NULL,
            pago INTEGER NOT NULL DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `)

    try {
        db.exec(`ALTER TABLE gastos ADD COLUMN pago INTEGER NOT NULL DEFAULT 0`)
    } catch {
        // coluna já adicionada, ignorandoo
    }

    // User Demo de testes
    const demoExists = db.prepare('SELECT id FROM users WHERE email = ?').get('demo@example.com')
    if (!demoExists) {
        db.prepare('INSERT INTO users (nome, email, senha) VALUES (?, ?, ?)').run(
            'Demo User',
            'demo@example.com',
            'demo123'
        )
    }
}

// Handlers de Autenticação
function setupAuthHandlers() {
    // Login
    ipcMain.handle('auth:login', (_, request: LoginRequest) => {
        try {
            const user = db.prepare('SELECT * FROM users WHERE email = ? AND senha = ?').get(
                request.email,
                request.senha
            )
            if (user) {
                return {
                    success: true,
                    user: {
                        id: user.id,
                        nome: user.nome,
                        email: user.email
                    }
                }
            }
            return { success: false, error: 'Email ou senha inválidos' }
        } catch (error) {
            console.error('Login error:', error)
            return { success: false, error: 'Erro ao fazer login' }
        }
    })

    // Cadastro
    ipcMain.handle('auth:register', (_, request: RegisterRequest) => {
        try {
            const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(request.email)
            if (existingUser) {
                return { success: false, error: 'Email já cadastrado' }
            }

            const stmt = db.prepare(
                'INSERT INTO users (nome, email, senha) VALUES (?, ?, ?)'
            )
            const result = stmt.run(request.nome, request.email, request.senha)

            return {
                success: true,
                user: {
                    id: result.lastInsertRowid,
                    nome: request.nome,
                    email: request.email
                }
            }
        } catch (error) {
            console.error('Register error:', error)
            return { success: false, error: 'Erro ao criar conta' }
        }
    })

    // Verificar email
    ipcMain.handle('auth:checkEmail', (_, email: string) => {
        try {
            const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
            return { exists: !!user }
        } catch (error) {
            return { exists: false }
        }
    })
}

// Funções de Inicialização e Consulta
function setupExpensesHandlers() {
    ipcMain.handle('gastos:getAll', (_, userId: number) => {
        return db.prepare('SELECT * FROM gastos WHERE user_id = ? ORDER BY data DESC').all(userId)
    })

    ipcMain.handle('gastos:getById', (_, id: number) => {
        return db.prepare('SELECT * FROM gastos WHERE id = ?').get(id)
    })

    ipcMain.handle('gastos:create', (_, gasto: Gasto & { user_id: number }) => {
        const stmt = db.prepare(`
            INSERT INTO gastos (user_id, descricao, total, categoria, data, pago)
            VALUES (@user_id, @descricao, @total, @categoria, @data, @pago)
        `)
        const result = stmt.run(gasto)
        return { id: result.lastInsertRowid, ...gasto }
    })

    ipcMain.handle('gastos:delete', (_, id: number) => {
        db.prepare('DELETE FROM gastos WHERE id = ?').run(id)
        return { success: true }
    })

    // pago = 0, nao pago = 1
    ipcMain.handle('gastos:togglePago', (_, id: number) => {
        db.prepare(`
            UPDATE gastos SET pago = CASE WHEN pago = 1 THEN 0 ELSE 1 END WHERE id = ?
        `).run(id)
        return { success: true }
    })
}

// Inicializar Database
export function initDatabase() {
    // Armazenando o Banco de Dados na appData do sistema
    const dbPath = path.join(app.getPath('userData'), 'finance.db')
    db = new Database(dbPath)
    setupDatabase()
    setupAuthHandlers()
    setupExpensesHandlers()
}