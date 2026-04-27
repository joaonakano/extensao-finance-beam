import { ipcMain, app } from 'electron'
import { createRequire } from 'node:module'
import path from 'path'


const require = createRequire(import.meta.url)
const Database = require('better-sqlite3')

// Entidades
interface Expense {
    id?: number
    user_id: number
    parent_id?: number | null
    category_id?: number | null
    payment_method_id?: number | null
    description: string
    amount: number
    is_paid: number
    is_recurring: number
    recurrence_type?: string | null
    date: string
    payment_date?: string | null
    notes?: string | null
}

interface Category {
    id?: number
    user_id: number
    name: string
    color?: string | null
    icon?: string | null
}

interface PaymentMethod {
    id?: number
    user_id: number
    name: string
    type: string
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
    // Tabela USERS - Usuários
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            senha TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now'))
        )
    `)

    // Tabela PAYMENT METHODS - Meios de Pagamento (Cartão, Pix, Dinheiro, etc)
    db.exec(`
        CREATE TABLE IF NOT EXISTS payment_methods (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,             -- "Cartão Nubank", "Pix", "Dinheiro"
            type TEXT NOT NULL,             -- "credito", "debito", "dinheiro", "pix"
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `)

    // Tabela CATEGORIES - Categorias
    db.exec(`
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,     -- "Alimentação", "Transporte"
            color TEXT,             -- "#FFFFFF", para mostrar na dashboard
            icon TEXT,              -- nome do ícone lucide
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `)
    
    // Tabela EXPENSES - Gastos
    db.exec(`
        CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            parent_id INTEGER,                  -- NULL = pai, preenchido = filho
            category_id INTEGER,                -- FK para tabela categories
            payment_method_id INTEGER,          -- FK para tabela payment_methods
            description TEXT NOT NULL,
            amount REAL NOT NULL DEFAULT 0,
            is_paid INTEGER NOT NULL DEFAULT 0,
            is_recurring INTEGER NOT NULL DEFAULT 0,
            recurrence_type TEXT,               -- "daily", "weekly", "monthly", "yearly"
            date TEXT NOT NULL,
            payment_date TEXT,
            notes TEXT,                         -- campo livre para observações
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (parent_id) REFERENCES expenses(id) ON DELETE CASCADE,
            FOREIGN KEY (category_id) REFERENCES categories(id),
            FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id)
        )
    `)

    // User Demo de testes
    const demoExists = db.prepare('SELECT id FROM users WHERE email = ?').get('demonstracao@gmail.com')
    if (!demoExists) {
        db.prepare('INSERT INTO users (nome, email, senha) VALUES (?, ?, ?)').run(
            'Usuario Demonstração',
            'demonstracao@gmail.com',
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
    // GET ALL (apenas pais, com total calculado dos filhos)
    ipcMain.handle('expenses:getAll', (_, userId: number) => {
        return db.prepare(`
            SELECT
                e.*,
                c.name as category_name,
                c.color as category_color,
                pm.name as payment_method_name,
                COALESCE(
                    (SELECT SUM(f.amount) FROM expenses f WHERE f.parent_id = e.id),
                    e.amount
                ) as total
            FROM expenses e
            LEFT JOIN categories c ON c.id = e.category_id
            LEFT JOIN payment_methods pm ON pm.id = e.payment_method_id
            WHERE e.user_id = ?
            AND e.parent_id IS NULL
            ORDER BY e.date DESC
        `).all(userId)
    })

    // GET CHILDREN (filhos de um gasto pai)
    ipcMain.handle('expenses:getChildren', (_, parentId: number) => {
        return db.prepare(`
            SELECT
                e.*,
                c.name as category_name,
                c.color as category_color,
                pm.name as payment_method_name
            FROM expenses e
            LEFT JOIN categories c ON c.id = e.category_id
            LEFT JOIN payment_methods pm ON pm.id = e.payment_method_id
            WHERE e.parent_id = ?
            ORDER BY e.date DESC
        `).all(parentId)
    })

    // GET BY ID
    ipcMain.handle('expenses:getById', (_, id: number) => {
        return db.prepare('SELECT * FROM expenses WHERE id = ?').get(id)
    })

    // CREATE
    ipcMain.handle('expenses:create', (_, expense: Expense) => {
        const stmt = db.prepare(`
            INSERT INTO expenses (
                user_id, parent_id, category_id, payment_method_id,
                description, amount, is_paid, is_recurring,
                recurrence_type, date, payment_date, notes
            ) VALUES (
                @user_id, @parent_id, @category_id, @payment_method_id,
                @description, @amount, @is_paid, @is_recurring,
                @recurrence_type, @date, @payment_date, @notes
            )
        `)
        const result = stmt.run(expense)
        return { id: result.lastInsertRowid, ...expense }
    })

    // UPDATE
    ipcMain.handle('expenses:update', (_, expense: Expense) => {
        const stmt = db.prepare(`
            UPDATE expenses SET
                category_id = @category_id,
                payment_method_id = @payment_method_id,
                description = @description,
                amount = @amount,
                is_paid = @is_paid,
                is_recurring = @is_recurring,
                recurrence_type = @recurrence_type,
                date = @date,
                payment_date = @payment_date,
                notes = @notes
            WHERE id = @id
        `)
        stmt.run(expense)
        return { success: true }
    })

    // TOGGLE PAID (pago = 0, nao pago = 1)
    ipcMain.handle('expenses:togglePaid', (_, id: number) => {
        db.prepare(`
            UPDATE expenses
            SET is_paid = CASE WHEN is_paid = 1 THEN 0 ELSE 1 END
            WHERE id = ?
        `).run(id)
        return { success: true }
    })

    // DELETE
    ipcMain.handle('expenses:delete', (_, id: number) => {
        db.prepare('DELETE FROM expenses WHERE id = ?').run(id)
        return { success: true }
    })
}

function setupSettingsHandlers() {
    // === HANDLERS DE CATEGORIAS ===

    // Buscar categorias
    ipcMain.handle('categories:getAll', (_, userId: number) => {
        return db.prepare(`
            SELECT *
            FROM categories
            WHERE user_id = ?
            ORDER BY name ASC
        `).all(userId)
    })

    // Criar categoria
    ipcMain.handle('categories:create', (_, category: Category) => {
        const stmt = db.prepare(`
            INSERT INTO categories (user_id, name, color, icon)
            VALUES (@user_id, @name, @color, @icon)
        `)
        const result = stmt.run(category)
        return { id: result.lastInsertRowid, ...category }
    })

    // Deletar categoria
    ipcMain.handle('categories:delete', (_, id: number) => {
        db.prepare('DELETE FROM categories WHERE id = ?').run(id)
        return { success: true}
    })

    // === HANDLERS DE MEIOS DE PAGAMENTO ===

    // Buscar meio de pagamento
    ipcMain.handle('paymentMethods:getAll', (_, userId: number) => {
        return db.prepare(`
            SELECT *
            FROM payment_methods
            WHERE user_id = ?
            ORDER BY name ASC
        `).all(userId)
    })

    // Criar meio de pagamento
    ipcMain.handle('paymentMethods:create', (_, method: PaymentMethod) => {
        const stmt = db.prepare(`
            INSERT INTO payment_methods (user_id, name, type)
            VALUES (@user_id, @name, @type)
        `)
        const result = stmt.run(method)
        return { id: result.lastInsertRowid, ...method }
    })

    // Deletar meio de pagamento
    ipcMain.handle('paymentMethods:delete', (_, id: number) => {
        db.prepare('DELETE FROM payment_methods WHERE id = ?').run(id)
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
    setupSettingsHandlers()
}