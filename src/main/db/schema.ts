import { db } from "./db"

/**
 * Cria as tabelas necessárias no banco de dados.
 */
export function setupSchema() {
  db.exec(`
    -- Suporte a chaves estrangeiras pro SQLite
    PRAGMA foreign_keys = ON;

    -- Tabela de Tipos de Usuários
    CREATE TABLE IF NOT EXISTS user_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    );

    -- Tabela de Usuários
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_type_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_type_id) REFERENCES user_types(id)
    );

    -- Tabela de Categorias
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      color TEXT DEFAULT '#808080',
      icon TEXT,
      status TEXT DEFAULT 'ativo',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Tabela Meios de Pagamento
    CREATE TABLE IF NOT EXISTS payment_methods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT DEFAULT 'ativo',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Tabela de Gastos
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      parent_id INTEGER DEFAULT NULL,
      category_id INTEGER,
      payment_method_id INTEGER,
      description TEXT NOT NULL,

      -- Armazenam-se os centavos em um inteiro para melhor precisão, R$ 10,35 = 1035
      amount INTEGER NOT NULL DEFAULT 0,

      date TEXT NOT NULL,
      is_paid INTEGER NOT NULL DEFAULT 0,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),

      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
      FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id) ON DELETE SET NULL,
      FOREIGN KEY (parent_id) REFERENCES expenses(id) ON DELETE CASCADE
    );

    -- Tabela de Quitações (Pagamentos Reais)
    CREATE TABLE IF NOT EXISTS settlements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      expense_id INTEGER NOT NULL,

      amount_paid INTEGER NOT NULL DEFAULT 0,

      payment_date TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),

      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE
    )
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

      console.log('Usuário administrador de teste criado.')
    }
  });

  runSeed();
}