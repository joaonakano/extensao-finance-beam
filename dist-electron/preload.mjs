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
  expenses: {
    getAll: (userId) => electron.ipcRenderer.invoke("expenses:getAll", userId),
    getChildren: (userId) => electron.ipcRenderer.invoke("expenses:getChildren", userId),
    getById: (id) => electron.ipcRenderer.invoke("expenses:getById", id),
    create: (expense) => electron.ipcRenderer.invoke("expenses:create", expense),
    update: (expense) => electron.ipcRenderer.invoke("expenses:update", expense),
    togglePaid: (id) => electron.ipcRenderer.invoke("expenses:togglePaid", id),
    delete: (id) => electron.ipcRenderer.invoke("expenses:delete", id)
  },
  categories: {
    getAll: (userId) => electron.ipcRenderer.invoke("categories:getAll", userId),
    create: (category) => electron.ipcRenderer.invoke("categories:create", category),
    delete: (id) => electron.ipcRenderer.invoke("categories:delete", id)
  },
  paymentMethods: {
    getAll: (userId) => electron.ipcRenderer.invoke("paymentMethods:getAll", userId),
    create: (paymentMethod) => electron.ipcRenderer.invoke("paymentMethods:create", paymentMethod),
    delete: (id) => electron.ipcRenderer.invoke("paymentMethods:delete", id)
  }
});
