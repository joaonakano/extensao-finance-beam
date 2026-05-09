export interface User {
    id: number;
    name: string;
    email: string;
    password_hash: string;
    user_type_id: number;
    created_at?: string;
}

// Níveis de acesso multiusuário
export type UserRole = 'admin' | 'financeiro' | 'funcionario';

export interface UserType {
    id: number;
    name: UserRole;
}

// Tipos de entrada para formulários
export type LoginInput = Pick<User, 'email'> & { password_plain: string };
export type RegisterInput = Omit<User, 'id' | 'created_at'> & { password_plain: string };