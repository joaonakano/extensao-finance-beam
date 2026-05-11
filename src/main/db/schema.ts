import { db } from "./db"

/**
 * Cria as tabelas necessárias no banco de dados.
 */
export function setupSchema() {
  db.exec(`
    -- Suporte a chaves estrangeiras pro SQLite
    PRAGMA foreign_keys = ON;

    -- ======================================
    -- USER TYPES
    -- ======================================

    CREATE TABLE IF NOT EXISTS user_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    );

    -- ======================================
    -- USERS
    -- ======================================

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      user_type_id INTEGER NOT NULL,

      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,

      created_at TEXT DEFAULT (datetime('now')),

      FOREIGN KEY (user_type_id)
        REFERENCES user_types(id)
    );

    -- ======================================
    -- CATEGORIES
    -- ======================================

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      user_id INTEGER NOT NULL,

      name TEXT NOT NULL,

      color TEXT DEFAULT '#808080',
      icon TEXT,

      status TEXT DEFAULT 'ativo',

      created_at TEXT DEFAULT (datetime('now')),

      FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
    );

    -- ======================================
    -- PAYMENT METHODS
    -- ======================================

    CREATE TABLE IF NOT EXISTS payment_methods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      user_id INTEGER NOT NULL,

      name TEXT NOT NULL,

      -- pix, dinheiro, cartao_credito
      -- cartao_debito, boleto, outro
      type TEXT NOT NULL,

      status TEXT DEFAULT 'ativo',

      created_at TEXT DEFAULT (datetime('now')),

      FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
    );

    -- ======================================
    -- EXPENSES
    -- ======================================

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      user_id INTEGER NOT NULL,

      -- Estrutura hierarquica
      parent_id INTEGER DEFAULT NULL,

      -- Categoria e meio de pagamento opcionais
      category_id INTEGER,
      payment_method_id INTEGER,

      -- Descrição da despesa
      description TEXT NOT NULL,

      -- Armazenam-se os centavos em um inteiro para melhor precisão,
      -- R$ 10,35 = 1035
      amount INTEGER NOT NULL DEFAULT 0,

      -- Data de vencimento
      due_date TEXT,

      -- pendente, parcial, pago, cancelado
      status TEXT NOT NULL DEFAULT 'pendente',

      -- Define se é agrupador
      -- Exemplo:
      -- fatura cartao = 1
      -- pizza = 0
      is_group INTEGER NOT NULL DEFAULT 0,

      -- Recorrencia futura
      recurrence_group_id INTEGER DEFAULT NULL,

      -- Parcelamento futuro
      installment_group_id INTEGER DEFAULT NULL,
      installment_number INTEGER DEFAULT NULL,
      installment_total INTEGER DEFAULT NULL,

      notes TEXT,

      created_at TEXT DEFAULT (datetime('now')),

      FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

      FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE SET NULL,

      FOREIGN KEY (payment_method_id)
        REFERENCES payment_methods(id)
        ON DELETE SET NULL,

      FOREIGN KEY (parent_id)
        REFERENCES expenses(id)
        ON DELETE CASCADE
    );

    -- ======================================
    -- SETTLEMENTS
    -- ======================================

    CREATE TABLE IF NOT EXISTS settlements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      user_id INTEGER NOT NULL,

      expense_id INTEGER NOT NULL,

      -- Valor pago em centavos
      amount_paid INTEGER NOT NULL DEFAULT 0,

      payment_date TEXT NOT NULL,

      notes TEXT,

      created_at TEXT DEFAULT (datetime('now')),

      FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

      FOREIGN KEY (expense_id)
        REFERENCES expenses(id)
        ON DELETE CASCADE
    );

    -- ======================================
    -- INDEXES
    -- ======================================
    
    CREATE INDEX IF NOT EXISTS idx_users_email
    ON users(email);

    CREATE INDEX IF NOT EXISTS idx_categories_user
    ON categories(user_id);

    CREATE INDEX IF NOT EXISTS idx_payment_methods_user
    ON payment_methods(user_id);

    CREATE INDEX IF NOT EXISTS idx_expenses_user
    ON expenses(user_id);

    CREATE INDEX IF NOT EXISTS idx_expenses_parent
    ON expenses(parent_id);

    CREATE INDEX IF NOT EXISTS idx_expenses_status
    ON expenses(status);

    CREATE INDEX IF NOT EXISTS idx_expenses_due_date
    ON expenses(due_date);

    CREATE INDEX IF NOT EXISTS idx_settlements_user
    ON settlements(user_id);

    CREATE INDEX IF NOT EXISTS idx_settlements_expense
    ON settlements(expense_id);
  `)
}

/**
 * Popula o banco com dados iniciais obrigatórios.
 * Roda apenas se as tabelas estiverem vazias.
 */
export function seedDatabase() {
  // Inserir os tipos de usuário padrão
  const userTypes = ['admin', 'financeiro', 'funcionario'];

  const insertType = db.prepare('INSERT OR IGNORE INTO user_types (name) VALUES (?)');

  // Transação para performance e integridade dos dados
  const runSeed = db.transaction(() => {
    for (const type of userTypes) {
      insertType.run(type)
    }

    // Criar usuário administrador de testes se não existir
    const adminExists = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@email.com');

    if (!adminExists) {
      const tempPassword = 'admin123';

      db.prepare(`
        INSERT INTO users (user_type_id, name, email, password)
        VALUES (
          (SELECT id FROM user_types WHERE name = 'admin'),
          'Administrador',
          'admin@email.com',
          ?
        )
      `).run(tempPassword);

      console.log(`Usuário administrador de teste criado.\b* user: admin@email.com\b* password: ${tempPassword}`)
    }
  });

  runSeed();
}