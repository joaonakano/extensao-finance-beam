import { app, ipcMain, BrowserWindow } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
const require$1 = createRequire(import.meta.url);
const Database = require$1("better-sqlite3");
const dbPath = path.join(app.getPath("userData"), "finance.db");
const db = new Database(dbPath);
function setupSchema() {
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
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id),
      FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id)
    );

    CREATE TABLE IF NOT EXISTS settlements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      expense_id INTEGER NOT NULL,
      amount_paid REAL NOT NULL,
      payment_date TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE
    );
  `);
  const demoUser = db.prepare("SELECT id FROM users WHERE email = ?").get("demo@finance.com");
  if (!demoUser) {
    const userId = db.prepare(
      "INSERT INTO users (nome, email, senha) VALUES ('Usuário Demo', 'demo@finance.com', '123456')"
    ).run().lastInsertRowid;
    db.prepare("INSERT INTO categories (user_id, name, color) VALUES (?, 'Alimentação', '#f97316')").run(userId);
    db.prepare("INSERT INTO categories (user_id, name, color) VALUES (?, 'Transporte', '#3b82f6')").run(userId);
    db.prepare("INSERT INTO categories (user_id, name, color) VALUES (?, 'Lazer', '#8b5cf6')").run(userId);
    db.prepare("INSERT INTO categories (user_id, name, color) VALUES (?, 'Saúde', '#10b981')").run(userId);
    db.prepare("INSERT INTO categories (user_id, name, color) VALUES (?, 'Moradia', '#f59e0b')").run(userId);
    db.prepare("INSERT INTO payment_methods (user_id, name, type) VALUES (?, 'Dinheiro', 'dinheiro')").run(userId);
    db.prepare("INSERT INTO payment_methods (user_id, name, type) VALUES (?, 'Pix', 'pix')").run(userId);
    db.prepare("INSERT INTO payment_methods (user_id, name, type) VALUES (?, 'Cartão de Crédito', 'cartao_credito')").run(userId);
    db.prepare("INSERT INTO payment_methods (user_id, name, type) VALUES (?, 'Cartão de Débito', 'cartao_debito')").run(userId);
  }
}
function setupAuthHandlers() {
  ipcMain.handle("auth:login", (_, email, senha) => {
    try {
      const user = db.prepare("SELECT * FROM users WHERE email = ? AND senha = ?").get(email, senha);
      if (!user) return { success: false, error: "E-mail ou senha incorretos." };
      return { success: true, user: { id: user.id, nome: user.nome, email: user.email } };
    } catch (err) {
      console.error("auth:login error", err);
      return { success: false, error: "Erro interno ao fazer login." };
    }
  });
  ipcMain.handle("auth:register", (_, nome, email, senha) => {
    var _a;
    try {
      const result = db.prepare(
        "INSERT INTO users (nome, email, senha) VALUES (?, ?, ?)"
      ).run(nome, email, senha);
      const userId = result.lastInsertRowid;
      const defaultCategories = [
        ["Alimentação", "#f97316"],
        ["Transporte", "#3b82f6"],
        ["Lazer", "#8b5cf6"],
        ["Saúde", "#10b981"],
        ["Moradia", "#f59e0b"],
        ["Outros", "#6b7280"]
      ];
      for (const [name, color] of defaultCategories) {
        db.prepare("INSERT INTO categories (user_id, name, color) VALUES (?, ?, ?)").run(userId, name, color);
      }
      const defaultPayments = [
        ["Dinheiro", "dinheiro"],
        ["Pix", "pix"],
        ["Cartão de Crédito", "cartao_credito"],
        ["Cartão de Débito", "cartao_debito"]
      ];
      for (const [name, type] of defaultPayments) {
        db.prepare("INSERT INTO payment_methods (user_id, name, type) VALUES (?, ?, ?)").run(userId, name, type);
      }
      return { success: true, id: userId };
    } catch (err) {
      if ((_a = err.message) == null ? void 0 : _a.includes("UNIQUE")) {
        return { success: false, error: "Este e-mail já está cadastrado." };
      }
      console.error("auth:register error", err);
      return { success: false, error: "Erro ao criar conta." };
    }
  });
  ipcMain.handle("auth:checkEmail", (_, email) => {
    const user = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    return { exists: !!user };
  });
}
function setupExpensesHandlers() {
  ipcMain.handle("expenses:getAll", (_, userId) => {
    return db.prepare(`
      SELECT
        e.*,
        c.name  AS category_name,
        c.color AS category_color,
        p.name  AS payment_method_name
      FROM expenses e
      LEFT JOIN categories c ON e.category_id = c.id
      LEFT JOIN payment_methods p ON e.payment_method_id = p.id
      WHERE e.user_id = ?
      ORDER BY e.date DESC, e.created_at DESC
    `).all(userId);
  });
  ipcMain.handle("expenses:getById", (_, id) => {
    return db.prepare("SELECT * FROM expenses WHERE id = ?").get(id);
  });
  ipcMain.handle("expenses:create", (_, expense) => {
    try {
      const result = db.prepare(`
        INSERT INTO expenses (user_id, description, total, category_id, payment_method_id, date, is_paid, is_recurring)
        VALUES (@user_id, @description, @total, @category_id, @payment_method_id, @date, @is_paid, @is_recurring)
      `).run(expense);
      return { success: true, id: result.lastInsertRowid };
    } catch (err) {
      console.error("expenses:create error", err);
      return { success: false, error: "Erro ao criar gasto." };
    }
  });
  ipcMain.handle("expenses:update", (_, expense) => {
    try {
      db.prepare(`
        UPDATE expenses
        SET description = @description, total = @total, category_id = @category_id,
            payment_method_id = @payment_method_id, date = @date,
            is_paid = @is_paid, is_recurring = @is_recurring
        WHERE id = @id
      `).run(expense);
      return { success: true };
    } catch (err) {
      console.error("expenses:update error", err);
      return { success: false, error: "Erro ao atualizar gasto." };
    }
  });
  ipcMain.handle("expenses:togglePaid", (_, id) => {
    try {
      db.prepare("UPDATE expenses SET is_paid = CASE WHEN is_paid = 1 THEN 0 ELSE 1 END WHERE id = ?").run(id);
      return { success: true };
    } catch (err) {
      console.error("expenses:togglePaid error", err);
      return { success: false, error: "Erro ao alterar status." };
    }
  });
  ipcMain.handle("expenses:delete", (_, id) => {
    try {
      db.prepare("DELETE FROM expenses WHERE id = ?").run(id);
      return { success: true };
    } catch (err) {
      console.error("expenses:delete error", err);
      return { success: false, error: "Erro ao excluir gasto." };
    }
  });
  ipcMain.handle("expenses:getChildren", (_, userId) => {
    return db.prepare("SELECT * FROM expenses WHERE user_id = ? AND is_recurring = 1").all(userId);
  });
}
function setupCategoriesHandlers() {
  ipcMain.handle("categories:getAll", (_, userId) => {
    return db.prepare("SELECT * FROM categories WHERE user_id = ? ORDER BY name ASC").all(userId);
  });
  ipcMain.handle("categories:create", (_, category) => {
    try {
      const result = db.prepare(
        "INSERT INTO categories (user_id, name, color) VALUES (@user_id, @name, @color)"
      ).run(category);
      return { success: true, id: result.lastInsertRowid };
    } catch (err) {
      console.error("categories:create error", err);
      return { success: false, error: "Erro ao criar categoria." };
    }
  });
  ipcMain.handle("categories:delete", (_, id) => {
    try {
      db.prepare("DELETE FROM categories WHERE id = ?").run(id);
      return { success: true };
    } catch (err) {
      console.error("categories:delete error", err);
      return { success: false, error: "Erro ao excluir categoria." };
    }
  });
}
function setupPaymentMethodsHandlers() {
  ipcMain.handle("paymentMethods:getAll", (_, userId) => {
    return db.prepare(
      "SELECT * FROM payment_methods WHERE user_id = ? AND status = 'ativo' ORDER BY name ASC"
    ).all(userId);
  });
  ipcMain.handle("paymentMethods:create", (_, pm) => {
    try {
      const result = db.prepare(
        "INSERT INTO payment_methods (user_id, name, type) VALUES (@user_id, @name, @type)"
      ).run(pm);
      return { success: true, id: result.lastInsertRowid };
    } catch (err) {
      console.error("paymentMethods:create error", err);
      return { success: false, error: "Erro ao criar meio de pagamento." };
    }
  });
  ipcMain.handle("paymentMethods:delete", (_, id) => {
    try {
      db.prepare("DELETE FROM payment_methods WHERE id = ?").run(id);
      return { success: true };
    } catch (err) {
      console.error("paymentMethods:delete error", err);
      return { success: false, error: "Erro ao excluir meio de pagamento." };
    }
  });
}
function initDatabase() {
  setupSchema();
  setupAuthHandlers();
  setupExpensesHandlers();
  setupCategoriesHandlers();
  setupPaymentMethodsHandlers();
  setupSettlementsHandlers();
}
function setupSettlementsHandlers() {
  ipcMain.handle("settlements:getByExpense", (_, expenseId) => {
    return db.prepare(
      "SELECT * FROM settlements WHERE expense_id = ? ORDER BY payment_date ASC"
    ).all(expenseId);
  });
  ipcMain.handle("settlements:create", (_, settlement) => {
    try {
      const expense = db.prepare("SELECT total FROM expenses WHERE id = ?").get(settlement.expense_id);
      if (!expense) return { success: false, error: "Despesa não encontrada." };
      const paidSoFar = db.prepare(
        "SELECT COALESCE(SUM(amount_paid), 0) AS total FROM settlements WHERE expense_id = ?"
      ).get(settlement.expense_id).total;
      const remaining = expense.total - paidSoFar;
      if (settlement.amount_paid > remaining + 1e-3) {
        return { success: false, error: `Valor superior ao saldo restante (R$ ${remaining.toFixed(2)}).` };
      }
      const result = db.prepare(
        "INSERT INTO settlements (expense_id, amount_paid, payment_date) VALUES (@expense_id, @amount_paid, @payment_date)"
      ).run(settlement);
      const newPaid = paidSoFar + settlement.amount_paid;
      if (newPaid >= expense.total - 1e-3) {
        db.prepare("UPDATE expenses SET is_paid = 1 WHERE id = ?").run(settlement.expense_id);
      }
      return { success: true, id: result.lastInsertRowid };
    } catch (err) {
      console.error("settlements:create error", err);
      return { success: false, error: "Erro ao registrar quitação." };
    }
  });
}
createRequire(import.meta.url);
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    // Adicione esta linha
    height: 800,
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname$1, "preload.mjs")
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(() => {
  initDatabase();
  createWindow();
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
