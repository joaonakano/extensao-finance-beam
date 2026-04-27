import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

export type ToastVariant = "default" | "success" | "error"

export interface ToastItem {
  id: number
  message: string
  variant: ToastVariant
}

let counter = 0
type Listener = (toasts: ToastItem[]) => void
let listeners: Listener[] = []
let toasts: ToastItem[] = []

function dispatch(next: ToastItem[]) {
  toasts = next
  listeners.forEach((l) => l(toasts))
}

export const toast = {
  success: (message: string) => {
    const item: ToastItem = { id: ++counter, message, variant: "success" }
    dispatch([...toasts, item])
    setTimeout(() => dispatch(toasts.filter((t) => t.id !== item.id)), 4000)
  },
  error: (message: string) => {
    const item: ToastItem = { id: ++counter, message, variant: "error" }
    dispatch([...toasts, item])
    setTimeout(() => dispatch(toasts.filter((t) => t.id !== item.id)), 4000)
  },
}

export function Toaster() {
  const [items, setItems] = React.useState<ToastItem[]>([])

  React.useEffect(() => {
    listeners.push(setItems)
    return () => { listeners = listeners.filter((l) => l !== setItems) }
  }, [])

  if (items.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {items.map((item) => (
        <div
          key={item.id}
          className={cn(
            "pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg min-w-64 max-w-sm",
            "animate-in slide-in-from-bottom-4 fade-in-0 duration-300",
            item.variant === "success" && "bg-card border-green-200 text-green-800 dark:border-green-800 dark:text-green-300",
            item.variant === "error" && "bg-card border-destructive/30 text-destructive",
            item.variant === "default" && "bg-card border-border text-foreground",
          )}
        >
          {item.variant === "success" && (
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <svg className="size-3 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </span>
          )}
          {item.variant === "error" && (
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-destructive/10">
              <X className="size-3 text-destructive" />
            </span>
          )}
          <span className="flex-1">{item.message}</span>
          <button
            onClick={() => dispatch(toasts.filter((t) => t.id !== item.id))}
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
