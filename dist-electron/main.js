import { app, ipcMain, BrowserWindow } from "electron";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import path from "path";
import path$1 from "node:path";
const require$1 = createRequire(import.meta.url);
const Database = require$1("better-sqlite3");
let db;
function setupDatabase() {
  db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            senha TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now'))
        )
    `);
  db.exec(`
        CREATE TABLE IF NOT EXISTS payment_methods (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,             -- "Cartão Nubank", "Pix", "Dinheiro"
            type TEXT NOT NULL,             -- "credito", "debito", "dinheiro", "pix"
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);
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
    `);
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
    `);
  const demoExists = db.prepare("SELECT id FROM users WHERE email = ?").get("demonstracao@gmail.com");
  if (!demoExists) {
    db.prepare("INSERT INTO users (nome, email, senha) VALUES (?, ?, ?)").run(
      "Usuario Demonstração",
      "demonstracao@gmail.com",
      "demo123"
    );
  }
}
function setupAuthHandlers() {
  ipcMain.handle("auth:login", (_, request) => {
    try {
      const user = db.prepare("SELECT * FROM users WHERE email = ? AND senha = ?").get(
        request.email,
        request.senha
      );
      if (user) {
        return {
          success: true,
          user: {
            id: user.id,
            nome: user.nome,
            email: user.email
          }
        };
      }
      return { success: false, error: "Email ou senha inválidos" };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Erro ao fazer login" };
    }
  });
  ipcMain.handle("auth:register", (_, request) => {
    try {
      const existingUser = db.prepare("SELECT id FROM users WHERE email = ?").get(request.email);
      if (existingUser) {
        return { success: false, error: "Email já cadastrado" };
      }
      const stmt = db.prepare(
        "INSERT INTO users (nome, email, senha) VALUES (?, ?, ?)"
      );
      const result = stmt.run(request.nome, request.email, request.senha);
      return {
        success: true,
        user: {
          id: result.lastInsertRowid,
          nome: request.nome,
          email: request.email
        }
      };
    } catch (error) {
      console.error("Register error:", error);
      return { success: false, error: "Erro ao criar conta" };
    }
  });
  ipcMain.handle("auth:checkEmail", (_, email) => {
    try {
      const user = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
      return { exists: !!user };
    } catch (error) {
      return { exists: false };
    }
  });
}
function setupExpensesHandlers() {
  ipcMain.handle("expenses:getAll", (_, userId) => {
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
        `).all(userId);
  });
  ipcMain.handle("expenses:getChildren", (_, parentId) => {
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
        `).all(parentId);
  });
  ipcMain.handle("expenses:getById", (_, id) => {
    return db.prepare("SELECT * FROM expenses WHERE id = ?").get(id);
  });
  ipcMain.handle("expenses:create", (_, expense) => {
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
        `);
    const result = stmt.run(expense);
    return { id: result.lastInsertRowid, ...expense };
  });
  ipcMain.handle("expenses:update", (_, expense) => {
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
        `);
    stmt.run(expense);
    return { success: true };
  });
  ipcMain.handle("expenses:togglePaid", (_, id) => {
    db.prepare(`
            UPDATE expenses
            SET is_paid = CASE WHEN is_paid = 1 THEN 0 ELSE 1 END
            WHERE id = ?
        `).run(id);
    return { success: true };
  });
  ipcMain.handle("expenses:delete", (_, id) => {
    db.prepare("DELETE FROM expenses WHERE id = ?").run(id);
    return { success: true };
  });
}
function setupSettingsHandlers() {
  ipcMain.handle("categories:getAll", (_, userId) => {
    return db.prepare(`
            SELECT *
            FROM categories
            WHERE user_id = ?
            ORDER BY name ASC
        `).all(userId);
  });
  ipcMain.handle("categories:create", (_, category) => {
    const stmt = db.prepare(`
            INSERT INTO categories (user_id, name, color, icon)
            VALUES (@user_id, @name, @color, @icon)
        `);
    const result = stmt.run(category);
    return { id: result.lastInsertRowid, ...category };
  });
  ipcMain.handle("categories:delete", (_, id) => {
    db.prepare("DELETE FROM categories WHERE id = ?").run(id);
    return { success: true };
  });
  ipcMain.handle("paymentMethods:getAll", (_, userId) => {
    return db.prepare(`
            SELECT *
            FROM payment_methods
            WHERE user_id = ?
            ORDER BY name ASC
        `).all(userId);
  });
  ipcMain.handle("paymentMethods:create", (_, method) => {
    const stmt = db.prepare(`
            INSERT INTO payment_methods (user_id, name, type)
            VALUES (@user_id, @name, @type)
        `);
    const result = stmt.run(method);
    return { id: result.lastInsertRowid, ...method };
  });
  ipcMain.handle("paymentMethods:delete", (_, id) => {
    db.prepare("DELETE FROM payment_methods WHERE id = ?").run(id);
    return { success: true };
  });
}
function initDatabase() {
  const dbPath = path.join(app.getPath("userData"), "finance.db");
  db = new Database(dbPath);
  setupDatabase();
  setupAuthHandlers();
  setupExpensesHandlers();
  setupSettingsHandlers();
}
const __dirname$1 = path$1.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path$1.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path$1.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path$1.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path$1.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    icon: path$1.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path$1.join(__dirname$1, "preload.mjs")
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path$1.join(RENDERER_DIST, "index.html"));
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
