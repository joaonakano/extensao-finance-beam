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
  expenses: {
    getAll: (userId: number) => ipcRenderer.invoke('expenses:getAll', userId),
    getChildren: (userId: number) => ipcRenderer.invoke('expenses:getChildren', userId),
    getById: (id: number) => ipcRenderer.invoke('expenses:getById', id),
    create: (expense: {
      user_id: number
      parent_id: number
      category_id: number
      payment_method_id: number
      description: string
      amount: number
      is_paid: number
      is_recurring: number
      recurrence_type: string
      date: string
      payment_date: string
      notes: string
    }) => ipcRenderer.invoke('expenses:create', expense),
    update: (expense: {
      category_id: number
      payment_method_id: number
      description: string
      amount: number
      is_paid: number
      is_recurring:number
      recurrence_type: string
      date: string
      payment_date: string
      notes: string
    }) => ipcRenderer.invoke('expenses:update', expense),
    togglePaid: (id: number) => ipcRenderer.invoke('expenses:togglePaid', id),
    delete: (id: number) => ipcRenderer.invoke('expenses:delete', id),
  },
  categories: {
    getAll: (userId: number) => ipcRenderer.invoke('categories:getAll', userId),
    create: (category: {
      user_id: number
      name: string
      color?: string | null
      icon?: string | null
    }) => ipcRenderer.invoke('categories:create', category),
    delete: (id: number) => ipcRenderer.invoke('categories:delete', id)
  },
  paymentMethods: {
    getAll: (userId: number) => ipcRenderer.invoke('paymentMethods:getAll', userId),
    create: (paymentMethod: {
      user_id: number
      name: string
      type: string
    }) => ipcRenderer.invoke('paymentMethods:create', paymentMethod),
    delete: (id: number) => ipcRenderer.invoke('paymentMethods:delete', id)
  }
})
