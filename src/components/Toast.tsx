import { useEffect, useState } from 'react'

export type ToastType = 'success' | 'error'

export interface ToastData {
    id: number
    message: string
    type: ToastType
}

interface ToastProps {
    toast: ToastData
    onRemove: (id: number) => void
}

function Toast({ toast, onRemove }: ToastProps) {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        // Animação de entrada
        const enterTimer = setTimeout(() => setVisible(true), 10)
        // Começa a sair após 3s
        const exitTimer = setTimeout(() => setVisible(false), 3200)
        // Remove do DOM após a animação de saída
        const removeTimer = setTimeout(() => onRemove(toast.id), 3700)
        return () => {
            clearTimeout(enterTimer)
            clearTimeout(exitTimer)
            clearTimeout(removeTimer)
        }
    }, [toast.id])

    const isSuccess = toast.type === 'success'

    return (
        <div
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium transition-all duration-500 max-w-sm ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            } ${
                isSuccess
                    ? 'bg-white border-green-200 text-green-800'
                    : 'bg-white border-red-200 text-red-800'
            }`}
        >
            <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                isSuccess ? 'bg-green-100' : 'bg-red-100'
            }`}>
                {isSuccess ? (
                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                ) : (
                    <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                )}
            </span>
            {toast.message}
        </div>
    )
}

// Container global de toasts
interface ToastContainerProps {
    toasts: ToastData[]
    onRemove: (id: number) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
            {toasts.map((t) => (
                <Toast key={t.id} toast={t} onRemove={onRemove} />
            ))}
        </div>
    )
}

// Hook para gerenciar toasts
let toastCounter = 0

export function useToast() {
    const [toasts, setToasts] = useState<ToastData[]>([])

    function addToast(message: string, type: ToastType) {
        const id = ++toastCounter
        setToasts((prev) => [...prev, { id, message, type }])
    }

    function removeToast(id: number) {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }

    const toast = {
        success: (message: string) => addToast(message, 'success'),
        error: (message: string) => addToast(message, 'error'),
    }

    return { toasts, toast, removeToast }
}
