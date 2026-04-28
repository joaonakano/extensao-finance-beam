import { Outlet } from "react-router-dom";
import { AppSidebar } from "./App-Sidebar";
import { SidebarProvider, SidebarTrigger } from "./ui/sidebar";

export function DashboardLayout() {
    return (
        <SidebarProvider>
            <div className="flex h-screen w-full">
                <AppSidebar />
                <main className="flex-1 overflow-y-auto bg-background">
                    <header className="flex h-12 items-center border-b px-4">
                        <SidebarTrigger />
                    </header>
                    {/* Dizem as más linguas que o Outlet é onde as páginas (Gastos, Pagamentos) vão renderizar */}
                    <Outlet />
                </main>
            </div>
        </SidebarProvider>
    )
}