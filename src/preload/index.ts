import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  auth: {
    login: (email: string, senha: string) =>
      ipcRenderer.invoke('auth:login', email, senha),
    register: (nome: string, email: string, senha: string) =>
      ipcRenderer.invoke('auth:register', nome, email, senha),
    checkEmail: (email: string) =>
      ipcRenderer.invoke('auth:checkEmail', email),
  },
  expenses: {
    getAll: (userId: number) =>
      ipcRenderer.invoke('expenses:getAll', userId),
    getChildrenByParent: (parentId: number) =>
      ipcRenderer.invoke('expenses:getChildrenByParent', parentId),
    getById: (id: number) =>
      ipcRenderer.invoke('expenses:getById', id),
    create: (expense: any) =>
      ipcRenderer.invoke('expenses:create', expense),
    update: (expense: any) =>
      ipcRenderer.invoke('expenses:update', expense),
    togglePaid: (id: number) =>
      ipcRenderer.invoke('expenses:togglePaid', id),
    delete: (id: number) =>
      ipcRenderer.invoke('expenses:delete', id),
  },
  categories: {
    getAll: (userId: number) =>
      ipcRenderer.invoke('categories:getAll', userId),
    create: (category: any) =>
      ipcRenderer.invoke('categories:create', category),
    delete: (id: number) =>
      ipcRenderer.invoke('categories:delete', id),
  },
  paymentMethods: {
      getAll: (userId: number) => ipcRenderer.invoke('paymentMethods:getAll', userId),
      create: (data: any) => ipcRenderer.invoke('paymentMethods:create', data),
      update: (data: any) => ipcRenderer.invoke('paymentMethods:update', data),
      delete: (id: number) => ipcRenderer.invoke('paymentMethods:delete', id),
  },
  settlements: {
    getByExpense: (expenseId: number) =>
      ipcRenderer.invoke('settlements:getByExpense', expenseId),
    create: (settlement: any) =>
      ipcRenderer.invoke('settlements:create', settlement),
  },
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
