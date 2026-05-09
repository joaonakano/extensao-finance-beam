import { registerAuthHandlers } from "./auth.handlers";
import { registerCategoriesHandlers } from "./category.handlers";
import { registerExpensesHandlers } from "./expenses";
import { registerPaymentMethodsHandlers } from "./paymentMethods";
import { registerSettlementsHandlers } from "./settlements";


export function registerIpcHandlers() {
    registerPaymentMethodsHandlers()
    registerCategoriesHandlers()
    registerExpensesHandlers()
    registerSettlementsHandlers()
    registerAuthHandlers()
}