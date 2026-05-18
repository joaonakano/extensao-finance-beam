/*
    RESPONSABILIDADES DO AUTH.ACTIONS
        -> Login
        -> Logout
        -> Register
        -> Cache
*/

import { LoginDTO, RegisterDTO } from "@shared/types";
import { QueryClient } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";

export async function login(
    dto: LoginDTO,
    queryClient: QueryClient,
) {
    const user = await authApi.login(dto)

    await queryClient.invalidateQueries({
        queryKey: ["auth"],
    })

    return user
}

export async function register(
    dto: RegisterDTO,
    queryClient: QueryClient,
) {
    const user = await authApi.register(dto)

    await queryClient.invalidateQueries({
        queryKey: ["auth"],
    })

    return user
}

export async function logout(
    queryClient: QueryClient,
) {
    await authApi.logout()

    await queryClient.invalidateQueries({
        queryKey: ["auth"],
    })

    await queryClient.clear()
}