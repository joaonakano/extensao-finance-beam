export interface Gasto {
    id?: number
    descricao: string
    total: number
    categoria: string
    data: string
}

declare global {
    interface Window {
        api: {
            gastos: {
                getAll: () => Promise<Gasto[]>
                getById: (id: number) => Promise<Gasto>
                create: (gasto: Omit<Gasto, 'id'>) => Promise<Gasto>
                delete: (id: number) => Promise<{ success: boolean }>
            }
        }
    }
}