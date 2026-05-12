import { useQuery } from "@tanstack/react-query";
import { expensesApi } from "../api/expenses.api";

/*
    REGRAS BÁSICAS PARA MELHOR ENTENDIMENTO DE ACTIONS, HOOKS E API

    1. Hooks: os hooks lidam apenas com a leitura de informações,
    2. Actions: os actions lidam com escrita e consistência de dados,
    3. API: a camada de API lida com os canais IPC diretamente, é através dessa interface que conversamos com o backend.

    Hierarquia recomendada: UI > Actions/Hook > API > IPC > SQLite
*/

export function useExpense(id: number) {
    return useQuery({
        queryKey: ["expenses", id],
        queryFn: () => expensesApi.getById(id),
        enabled: !!id,
    })
}