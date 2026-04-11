import { ipcRenderer, contextBridge } from 'electron'

// --------- Expose some API to the Renderer process ---------
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

  // You can expose other APTs you need here.
  // ...
})

contextBridge.exposeInMainWorld('api', {
  auth: {
    login: (email: string, senha: string) =>
      ipcRenderer.invoke('auth:login', { email, senha }),
    register: (nome: string, email: string, senha: string) =>
      ipcRenderer.invoke('auth:register', { nome, email, senha }),
    checkEmail: (email: string) =>
      ipcRenderer.invoke('auth:checkEmail', email),
  },
  gastos: {
    getAll: (userId: number) => ipcRenderer.invoke('gastos:getAll', userId),
    getById: (id: number) => ipcRenderer.invoke('gastos:getById', id),
    create: (gasto: {
      descricao: string
      total: number
      categoria: string
      data: string
      user_id: number
    }) => ipcRenderer.invoke('gastos:create', gasto),
    delete: (id: number) => ipcRenderer.invoke('gastos:delete', id),
  }
})
