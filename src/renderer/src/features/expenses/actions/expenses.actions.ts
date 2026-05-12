import { CreateExpenseDTO, UpdateExpenseDTO } from "@shared/types";
import { QueryClient } from "@tanstack/react-query";
import { expensesApi } from "../api/expenses.api";

/*
    REGRAS BÁSICAS PARA MELHOR ENTENDIMENTO DE ACTIONS, HOOKS E API

    1. Hooks: os hooks lidam apenas com a leitura de informações,
    2. Actions: os actions lidam com escrita e consistência de dados,
    3. API: a camada de API lida com os canais IPC diretamente, é através dessa interface que conversamos com o backend.

    Hierarquia recomendada: UI > Actions/Hook > API > IPC > SQLite
*/

export async function createExpense(
    dto: CreateExpenseDTO,
    queryClient: QueryClient,
) {
    const id = await expensesApi.create(dto)

    await queryClient.invalidateQueries({ queryKey: ["expenses"] })

    if (dto.parentId) {
        await queryClient.invalidateQueries({
            queryKey: ["expenses", "children", dto.parentId],
        })
    }

    return id
}

export async function updateExpense(
    dto: UpdateExpenseDTO,
    queryClient: QueryClient,
) {
    await expensesApi.update(dto)

    await queryClient.invalidateQueries({ queryKey: ["expenses"] })

    return true
}

export async function deleteExpense(
    id: number,
    queryClient: QueryClient,
) {
    await expensesApi.delete(id)

    await queryClient.invalidateQueries({ queryKey: ["expenses"] })

    return true
}

export async function togglePaid(
    params: {
        id: number,
        currentStatus: string,
        parentId?: number | null
    },
    queryClient: QueryClient,
) {
    const newStatus = params.currentStatus === "pago" ? "pendente" : "pago"

    await expensesApi.update({
        id: params.id,
        status: newStatus as any,
    })

    await queryClient.invalidateQueries({ queryKey: ["expenses"] })

    if (params.parentId) {
        await queryClient.invalidateQueries({
            queryKey: ["expenses", "children", params.parentId],
        })
    }

    return true
}