import { ipcRenderer, contextBridge } from 'electron'

// Mantém o ipcRenderer original para compatibilidade
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },
})

// Expõe window.api estruturada para o frontend
contextBridge.exposeInMainWorld('api', {
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
    getChildren: (userId: number) =>
      ipcRenderer.invoke('expenses:getChildren', userId),
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
    getAll: (userId: number) =>
      ipcRenderer.invoke('paymentMethods:getAll', userId),
    create: (pm: any) =>
      ipcRenderer.invoke('paymentMethods:create', pm),
    delete: (id: number) =>
      ipcRenderer.invoke('paymentMethods:delete', id),
  },
})
