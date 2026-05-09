import { ipcMain } from "electron";
import { db } from "@main/db/db";
import { CreateRequest, Expense, GetByIdRequest, GetRequest, IPCResponse, SubExpenseView } from "@shared/types";

export function registerExpensesHandlers() {

    ipcMain.handle('expenses:getAll', async (_, request: GetRequest): Promise<IPCResponse<Expense[]>> => {
        try {
            const data = db.prepare(`
                SELECT
                    e.*,
                    c.name  AS category_name,
                    c.color AS category_color,
                    p.name  AS payment_method_name,
                    COALESCE(SUM(s.amount_paid), 0) AS amount_paid,
                    CASE 
                        WHEN COALESCE(SUM(s.amount_paid), 0) >= e.amount THEN 0
                        ELSE e.amount - COALESCE(SUM(s.amount_paid), 0)
                    END AS remaining_amount,
                    (SELECT COUNT(*) FROM expenses ch WHERE ch.parent_id = e.id) AS children_count
                FROM expenses e
                LEFT JOIN categories c ON e.category_id = c.id
                LEFT JOIN payment_methods p ON e.payment_method_id = p.id
                LEFT JOIN settlements s ON e.id = s.expense_id
                WHERE e.user_id = @user_id AND e.parent_id IS NULL
                GROUP BY e.id
                ORDER BY e.date DESC, e.created_at DESC
            `).all(request) as Expense[]
        
            return { success: true, data: data ?? [] }
        } catch (err) {
            console.error('[IPC] expenses:getAll error:', err)
            return { success: false, error: 'Erro ao buscar despesas.' }
        }
    })

    ipcMain.handle('expenses:getChildrenByParent', async (_, request: GetByIdRequest): Promise<IPCResponse<SubExpenseView[]>> => {
        try {
            const data = db.prepare(`
                SELECT
                    e.*,
                    c.name  AS category_name,
                    c.color AS category_color,
                    p.name  AS payment_method_name,
                    COALESCE(SUM(s.amount_paid), 0) AS amount_paid,
                    CASE 
                        WHEN COALESCE(SUM(s.amount_paid), 0) >= e.amount THEN 0
                        ELSE e.amount - COALESCE(SUM(s.amount_paid), 0)
                    END AS remaining_amount
                FROM expenses e
                LEFT JOIN categories c ON e.category_id = c.id
                LEFT JOIN payment_methods p ON e.payment_method_id = p.id
                LEFT JOIN settlements s ON e.id = s.expense_id
                WHERE e.parent_id = @id AND e.user_id = @user_id
                GROUP BY e.id
                ORDER BY e.date ASC, e.created_at ASC
            `).all(request) as SubExpenseView[]

            return { success: true, data: data ?? [] }
        } catch (err) {
            console.error('[IPC] expenses:getChildrenByParent error:', err)
            return { success: false, error: 'Erro ao buscar sub-despesas.' }
        }
    })

    ipcMain.handle('expenses:getById', async (_, request: GetByIdRequest): Promise<IPCResponse<Expense>> => {
        try {
            const data = db.prepare(`
                SELECT *
                FROM expenses
                WHERE id = @id AND user_id = @user_id
            `).get(request)

            if (!data) {
                return { success: false, error: 'Despesa não encontrada.' }
            }

            return { success: true, data }
        } catch (err) {
            console.error('[IPC] expenses:getById error:', err)
            return { success: false, error: 'Erro ao buscar despesa.' }
        }
    })

    ipcMain.handle('expenses:create', async (_, request: CreateRequest<Expense>): Promise<IPCResponse<Number>> => {
        try {
            const result = db.prepare(`
                INSERT INTO expenses (
                    user_id,
                    description,
                    total,
                    category_id,
                    payment_method_id,
                    date,
                    is_paid,
                    is_recurring,
                    parent_id
                ) VALUES (
                    @user_id,
                    @description,
                    @total,
                    @category_id,
                    @payment_method_id,
                    @date,
                    @is_paid,
                    @is_recurring,
                    @parent_id
                )
            `).run({ parent_id: null, ...request })

            return {
                success: true,
                data: { id: Number(result.lastInsertRowid) }
            }
        } catch (err) {
            console.error('expenses:create error', err)
            return { success: false, error: 'Erro ao criar despesa.' }
        }
    })

    ipcMain.handle('expenses:update', (_, expense: any): IPCResponse<null> => {
        try {
            const result = db.prepare(`
                UPDATE expenses
                SET description = @description,
                    total = @total,
                    category_id = @category_id,
                    payment_method_id = @payment_method_id,
                    date = @date,
                    is_paid = @is_paid,
                    is_recurring = @is_recurring
                WHERE id = @id
            `).run(expense)

            if (result.changes === 0) {
                return { success: false, error: 'Despesa não encontrada.' }
            }

            return { success: true, data: null }
        } catch (err) {
            console.error('expenses:update error', err)
            return { success: false, error: 'Erro ao atualizar despesa.' }
        }
    })

    ipcMain.handle('expenses:togglePaid', (_, id: number): IPCResponse<null> => {
        try {
            const result = db.prepare(`
                UPDATE expenses
                SET is_paid = CASE WHEN is_paid = 1 THEN 0 ELSE 1 END
                WHERE id = ?
            `).run(id)

            if (result.changes === 0) {
                return { success: false, error: 'Despesa não encontrada.' }
            }

            return { success: true, data: null }
        } catch (err) {
            console.error('expenses:togglePaid error', err)
            return { success: false, error: 'Erro ao alterar status.' }
        }
    })

    ipcMain.handle('expenses:delete', (_, id: number): IPCResponse<null> => {
        try {
            const result = db.prepare(`
                DELETE FROM expenses
                WHERE id = ?
            `).run(id)

            if (result.changes === 0) {
                return { success: false, error: 'Despesa não encontrada.' }
            }

            return { success: true, data: null }
        } catch (err) {
            console.error('expenses:delete error', err)
            return { success: false, error: 'Erro ao excluir despesa.' }
        }
    })
}