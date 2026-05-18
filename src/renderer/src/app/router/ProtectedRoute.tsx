import { useAuth } from "@/features/auth/hooks/useAuth"
import { Navigate } from "react-router-dom"

interface Props {
    children: React.ReactNode
}

export function ProtectedRoute({
    children,
}: Props) {
    const {
        isLoading,
        isAuthenticated,
    } = useAuth()

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                Carregando...
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace/>
    }

    return children
}