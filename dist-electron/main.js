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
        CREATE TABLE IF NOT EXISTS gastos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            descricao TEXT NOT NULL,
            total REAL NOT NULL,
            categoria TEXT NOT NULL,
            data TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);
  const demoExists = db.prepare("SELECT id FROM users WHERE email = ?").get("demo@example.com");
  if (!demoExists) {
    db.prepare("INSERT INTO users (nome, email, senha) VALUES (?, ?, ?)").run(
      "Demo User",
      "demo@example.com",
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
  ipcMain.handle("gastos:getAll", (_, userId) => {
    return db.prepare("SELECT * FROM gastos WHERE user_id = ? ORDER BY data DESC").all(userId);
  });
  ipcMain.handle("gastos:getById", (_, id) => {
    return db.prepare("SELECT * FROM gastos WHERE id = ?").get(id);
  });
  ipcMain.handle("gastos:create", (_, gasto) => {
    const stmt = db.prepare(`
            INSERT INTO gastos (user_id, descricao, total, categoria, data)
            VALUES (@user_id, @descricao, @total, @categoria, @data)
        `);
    const result = stmt.run(gasto);
    return { id: result.lastInsertRowid, ...gasto };
  });
  ipcMain.handle("gastos:delete", (_, id) => {
    db.prepare("DELETE FROM gastos WHERE id = ?").run(id);
    return { success: true };
  });
}
function initDatabase() {
  const dbPath = path.join(app.getPath("userData"), "finance.db");
  db = new Database(dbPath);
  setupDatabase();
  setupAuthHandlers();
  setupExpensesHandlers();
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
