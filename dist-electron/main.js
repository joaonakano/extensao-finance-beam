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
        CREATE TABLE IF NOT EXISTS gastos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            descricao TEXT NOT NULL,
            total REAL NOT NULL,
            categoria TEXT NOT NULL,
            data TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now'))
        )
    `);
}
function setupExpensesHandlers() {
  ipcMain.handle("gastos:getAll", () => {
    return db.prepare("SELECT * FROM gastos ORDER BY data DESC").all();
  });
  ipcMain.handle("gastos:getById", (_, id) => {
    return db.prepare("SELECT * FROM gastos WHERE id = ?").get(id);
  });
  ipcMain.handle("gastos:create", (_, gasto) => {
    const stmt = db.prepare(`
            INSERT INTO gastos (descricao, total, categoria, data)
            VALUES (@descricao, @total, @categoria, @data)
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
