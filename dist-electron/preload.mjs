"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(channel, (event, ...args2) => listener(event, ...args2));
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  }
  // You can expose other APTs you need here.
  // ...
});
electron.contextBridge.exposeInMainWorld("api", {
  auth: {
    login: (email, senha) => electron.ipcRenderer.invoke("auth:login", { email, senha }),
    register: (nome, email, senha) => electron.ipcRenderer.invoke("auth:register", { nome, email, senha }),
    checkEmail: (email) => electron.ipcRenderer.invoke("auth:checkEmail", email)
  },
  gastos: {
    getAll: (userId) => electron.ipcRenderer.invoke("gastos:getAll", userId),
    getById: (id) => electron.ipcRenderer.invoke("gastos:getById", id),
    create: (gasto) => electron.ipcRenderer.invoke("gastos:create", gasto),
    delete: (id) => electron.ipcRenderer.invoke("gastos:delete", id)
  }
});
