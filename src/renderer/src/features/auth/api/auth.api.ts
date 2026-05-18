/*
    RESPONSABILIDADES DO AUTH.API
        -> IPC (me(), login(), logout(), register())
*/

import { handleApi } from "@/services/api";
import { LoginDTO, RegisterDTO, User } from "@shared/types";

export const authApi = {
    me: async (): Promise<User | null> => {
        return handleApi(window.api.auth.me())
    },

    login: async (data: LoginDTO): Promise<User> => {
        return handleApi(window.api.auth.login(data))
    },

    register: async (data: RegisterDTO): Promise<User> => {
        return handleApi(window.api.auth.register(data))
    },

    logout: async (): Promise<void> => {
        return handleApi(window.api.auth.logout())
    }
}