import { db } from "./db"

export function setupSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      senha TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT '#6366f1',
      status TEXT NOT NULL DEFAULT 'ativo',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS payment_methods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'outro',
      status TEXT NOT NULL DEFAULT 'ativo',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      description TEXT NOT NULL,
      total REAL NOT NULL,
      category_id INTEGER,
      payment_method_id INTEGER,
      date TEXT NOT NULL,
      is_paid INTEGER NOT NULL DEFAULT 0,
      is_recurring INTEGER NOT NULL DEFAULT 0,
      parent_id INTEGER DEFAULT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id),
      FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id),
      FOREIGN KEY (parent_id) REFERENCES expenses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS settlements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      expense_id INTEGER NOT NULL,
      amount_paid REAL NOT NULL,
      payment_date TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE
    );
  `)

  // Migration: adiciona parent_id se não existir (bancos já criados)
  const cols = db.prepare("PRAGMA table_info(expenses)").all() as any[]
  if (!cols.find((c) => c.name === 'parent_id')) {
    db.exec("ALTER TABLE expenses ADD COLUMN parent_id INTEGER DEFAULT NULL REFERENCES expenses(id) ON DELETE CASCADE")
  }

  // Seed: usuário demo
  const demoUser = db.prepare('SELECT id FROM users WHERE email = ?').get('demo@finance.com')
  if (!demoUser) {
    const userId = db.prepare(
      "INSERT INTO users (nome, email, senha) VALUES ('Usuário Demo', 'demo@finance.com', '123456')"
    ).run().lastInsertRowid

    db.prepare("INSERT INTO categories (user_id, name, color) VALUES (?, 'Alimentação', '#f97316')").run(userId)
    db.prepare("INSERT INTO categories (user_id, name, color) VALUES (?, 'Transporte', '#3b82f6')").run(userId)
    db.prepare("INSERT INTO categories (user_id, name, color) VALUES (?, 'Lazer', '#8b5cf6')").run(userId)
    db.prepare("INSERT INTO categories (user_id, name, color) VALUES (?, 'Saúde', '#10b981')").run(userId)
    db.prepare("INSERT INTO categories (user_id, name, color) VALUES (?, 'Moradia', '#f59e0b')").run(userId)

    db.prepare("INSERT INTO payment_methods (user_id, name, type) VALUES (?, 'Dinheiro', 'dinheiro')").run(userId)
    db.prepare("INSERT INTO payment_methods (user_id, name, type) VALUES (?, 'Pix', 'pix')").run(userId)
    db.prepare("INSERT INTO payment_methods (user_id, name, type) VALUES (?, 'Cartão de Crédito', 'cartao_credito')").run(userId)
    db.prepare("INSERT INTO payment_methods (user_id, name, type) VALUES (?, 'Cartão de Débito', 'cartao_debito')").run(userId)
  }
}