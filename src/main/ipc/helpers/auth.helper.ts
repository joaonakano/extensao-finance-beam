import { getCurrentUser } from "@main/session/session.store";

import { IPCResponse, User } from "@shared/types";

export function requireAuth():
    | IPCResponse<never>
    | User {

    const user = getCurrentUser()

    if (!user) {
        return {
            success: false,
            error: 'Usuário não autenticado.'
        }
    }

    return user
}