import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { Api, IPC_CHANNELS } from '@shared/ipc'

// Custom APIs for renderer
const api: Api = {
  auth: {
    login: (data) =>
      ipcRenderer.invoke(IPC_CHANNELS.AUTH_LOGIN, data),

    register: (data) =>
      ipcRenderer.invoke(IPC_CHANNELS.AUTH_REGISTER, data),

    logout: () =>
      ipcRenderer.invoke(IPC_CHANNELS.AUTH_LOGOUT),

    me: () =>
      ipcRenderer.invoke(IPC_CHANNELS.AUTH_ME)
  },

  categories: {
    getAll: () =>
      ipcRenderer.invoke(IPC_CHANNELS.CATEGORIES_GET_ALL),

    getById: (id) =>
      ipcRenderer.invoke(IPC_CHANNELS.CATEGORIES_GET_BY_ID, id),

    create: (data) =>
      ipcRenderer.invoke(IPC_CHANNELS.CATEGORIES_CREATE, data),

    update: (data) =>
      ipcRenderer.invoke(IPC_CHANNELS.CATEGORIES_UPDATE, data),

    delete: (id) =>
      ipcRenderer.invoke(IPC_CHANNELS.CATEGORIES_DELETE, id),
  },

  paymentMethods: {
    getAll: () =>
      ipcRenderer.invoke(IPC_CHANNELS.PAYMENT_METHODS_GET_ALL),
    
    getById: (id) =>
      ipcRenderer.invoke(IPC_CHANNELS.PAYMENT_METHODS_GET_BY_ID, id),

    create: (data) =>
      ipcRenderer.invoke(IPC_CHANNELS.PAYMENT_METHODS_CREATE, data),

    update: (data) =>
      ipcRenderer.invoke(IPC_CHANNELS.PAYMENT_METHODS_UPDATE, data),

    delete: (id) =>
      ipcRenderer.invoke(IPC_CHANNELS.PAYMENT_METHODS_DELETE, id),
  },

  expenses: {
    getAll: () =>
      ipcRenderer.invoke(IPC_CHANNELS.EXPENSES_GET_ALL),

    getById: (id) =>
      ipcRenderer.invoke(IPC_CHANNELS.EXPENSES_GET_BY_ID, id),

    getChildren: (parentId) =>
      ipcRenderer.invoke(
        IPC_CHANNELS.EXPENSES_GET_CHILDREN,
        parentId
      ),

    create: (data) =>
      ipcRenderer.invoke(IPC_CHANNELS.EXPENSES_CREATE, data),

    update: (data) =>
      ipcRenderer.invoke(IPC_CHANNELS.EXPENSES_UPDATE, data),

    delete: (id) =>
      ipcRenderer.invoke(IPC_CHANNELS.EXPENSES_DELETE, id),
  },
  
  settlements: {
    getAll: () =>
      ipcRenderer.invoke(IPC_CHANNELS.SETTLEMENTS_GET_ALL),
    
    getById: (id) =>
      ipcRenderer.invoke(IPC_CHANNELS.SETTLEMENTS_GET_BY_ID, id),

    getByExpense: (expenseId) =>
      ipcRenderer.invoke(
        IPC_CHANNELS.SETTLEMENTS_GET_BY_EXPENSE,
        expenseId
      ),

    create: (data) =>
      ipcRenderer.invoke(
        IPC_CHANNELS.SETTLEMENTS_CREATE,
        data
      ),

    delete: (id) =>
      ipcRenderer.invoke(IPC_CHANNELS.SETTLEMENTS_DELETE, id),
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
