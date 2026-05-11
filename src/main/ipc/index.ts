import { registerAuthHandlers } from "./auth.handlers";
import { registerCategoriesHandlers } from "./category.handlers";
import { registerExpensesHandlers } from "./expense.handlers";
import { registerPaymentMethodsHandlers } from "./payment-method.handlers";
import { registerSettlementsHandlers } from "./settlement.handlers";

export function registerIpcHandlers() {
    registerPaymentMethodsHandlers()
    registerCategoriesHandlers()
    registerExpensesHandlers()
    registerSettlementsHandlers()
    registerAuthHandlers()
}