import { registerAuthHandlers } from "./auth";
import { registerCategoriesHandlers } from "./categories";
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