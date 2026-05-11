import { db } from "@main/db/db"
import { ExpenseRepository } from "@main/repositories/expense.repository"
import { SettlementRepository } from "@main/repositories/settlement.repository"
import { CreateSettlementDTO } from "@shared/types"

export class SettlementService {

    private static calculateStatus(
        total: number,
        paid: number,
    ) {
        if (paid <= 0) {
            return 'pendente'
        }

        if (paid < total) {
            return 'parcial'
        }

        return 'pago'
    }

    private static refreshExpenseStatus(
        expenseId: number,
        userId: number,
    ) {
        const expense = ExpenseRepository.getById(
            expenseId,
            userId,
        )

        if (!expense) {
            throw new Error('Despesa não encontrada.')
        }

        const totalPaid = SettlementRepository.getTotalPaidByExpense(
            expenseId,
            userId
        )

        const status = SettlementService.calculateStatus(
            expense.amount,
            totalPaid,
        )

        ExpenseRepository.updateStatus(
            expenseId,
            userId,
            status
        )
    }

    static create(
        userId: number,
        data: CreateSettlementDTO
    ) {
        return db.transaction(() => {
            const expense = ExpenseRepository.getById(
                data.expenseId,
                userId,
            )

            if (!expense) {
                throw new Error('Despesa não encontrada.')
            }

            const paidSoFar = SettlementRepository.getTotalPaidByExpense(
                data.expenseId,
                userId
            )

            const remaining = expense.amount - paidSoFar

            if (data.amountPaid > remaining) {
                throw new Error('Valor maior que saldo restante.')
            }

            const id = SettlementRepository.create(
                userId,
                data
            )

            SettlementService.refreshExpenseStatus(
                data.expenseId,
                userId
            )

            return Number(id)
        })()
    }

    static delete(
        userId: number,
        settlementId: number
    ) {
        return db.transaction(() => {
            const settlement = SettlementRepository.getById(
                settlementId,
                userId
            )

            if (!settlement) {
                throw new Error('Quitação não encontrada.')
            }

            SettlementRepository.delete(
                settlementId,
                userId
            )

            SettlementService.refreshExpenseStatus(
                settlement.expenseId,
                userId
            )
        })()
    }
}