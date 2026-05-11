import { ipcMain } from "electron"

import type {
    IPCResponse,
    User,
} from "@shared/types"

import { IPC_CHANNELS } from "@shared/ipc"

import { AuthRepository } from "@main/repositories/auth.repository"

import { getCurrentUser, setCurrentUser } from "@main/session/session.store"

export function registerAuthHandlers() {
    ipcMain.handle(
        IPC_CHANNELS.AUTH_LOGIN,
        async (_, data): Promise<IPCResponse<User>> => {
            try {
                const user = AuthRepository.findByEmail(
                    data.email
                )

                if (!user) {
                    return {
                        success: false,
                        error: 'Usuário não encontrado.',
                    }
                }

                const passwordMatch = user.password === data.password

                if (!passwordMatch) {
                    return {
                        success: false,
                        error: 'Senha incorreta.',
                    }
                }

                setCurrentUser(user)

                return {
                    success: true,
                    data: user,
                }
            } catch (err) {
                console.error('[IPC] auth:login error:', err)
                
                return {
                    success: false,
                    error: 'Erro interno ao fazer login.',
                }
            }
        }
    )

    ipcMain.handle(
        IPC_CHANNELS.AUTH_REGISTER,
        async (_, data): Promise<IPCResponse<User>> => {
            try {
                const existingUser = AuthRepository.findByEmail(data.email)
                
                if (existingUser) {
                    return {
                        success: false,
                        error: 'Email já cadastrado.'
                    }
                }

                // Trocar para bcrypt depois
                const userId = AuthRepository.create({
                    ...data,
                    password: data.password,
                })

                const createdUser = AuthRepository.findById(userId)

                if (!createdUser) {
                    return {
                        success: false,
                        error: 'Erro ao criar usuário.',
                    }
                }

                setCurrentUser(createdUser)

                return {
                    success: true,
                    data: createdUser
                }
            } catch (err) {
                console.error('[IPC] auth:register error:', err)

                return {
                    success: false,
                    error: 'Erro ao registrar usuário.'
                }
            }
        }
    )

    ipcMain.handle(
        IPC_CHANNELS.AUTH_LOGOUT,
        async (): Promise<IPCResponse<void>> => {
            try {
                setCurrentUser(null)

                return {
                    success: true,
                    data: undefined,
                }
            } catch (err) {
                console.error('[IPC] auth:logout error:', err)

                return {
                    success: false,
                    error: 'Erro ao realizar logout.'
                }
            }
        }
    )

    ipcMain.handle(
        IPC_CHANNELS.AUTH_ME,
        async (): Promise<IPCResponse<User | null>> => {
            try {
                return {
                    success: true,
                    data: getCurrentUser(),
                }
            } catch (err) {
                console.error('[IPC] auth:me error:', err)

                return {
                    success: false,
                    error: 'Erro ao buscar sessão.',
                }
            }
        }
    )
}