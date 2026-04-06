import { ipcMain, app } from 'electron'
import { createRequire } from 'node:module'
import path from 'path'


const require = createRequire(import.meta.url)
const Database = require('better-sqlite3')


// Entidade gasto
interface Gasto {
    id?: number
    descricao: string
    total: number
    categoria: string
    data: string
}

let db: ReturnType<typeof Database>

// Setup
function setupDatabase() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS gastos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            descricao TEXT NOT NULL,
            total REAL NOT NULL,
            categoria TEXT NOT NULL,
            data TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now'))
        )
    `)
}

// Funções de Inicialização e Consulta
function setupExpensesHandlers() {
    ipcMain.handle('gastos:getAll', () => {
        return db.prepare('SELECT * FROM gastos ORDER BY date DESC').all()
    })

    ipcMain.handle('gastos:getById', (_, id: number) => {
        return db.prepare('SELECT * FROM gastos WHERE id = ?').get(id)
    })

    ipcMain.handle('gastos:create', (_, gasto: Gasto) => {
        const stmt = db.prepare(`
            INSERT INTO gastos (descricao, total, categoria, data)
            VALUES (@descricao, @total, @categoria, @data)
        `)
        const result = stmt.run(stmt)
        return { id: result.lastInsertRowid, ...gasto }
    })

    ipcMain.handle('gastos:delete', (_, id: number) => {
        db.prepare('DELETE FROM gastos WHERE id = ?').run(id)
        return { success: true }
    })
}

// Inicializar Database
export function initDatabase() {
    // Armazenando o Banco de Dados na appData do sistema
    const dbPath = path.join(app.getPath('userData'), 'finance.db')
    db = new Database(dbPath)
    setupDatabase()
    setupExpensesHandlers()
}