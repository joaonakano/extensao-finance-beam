import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { LayoutDashboard, Receipt, Wallet } from "lucide-react";
import { Link } from "react-router-dom";

export function AppSidebar() {
    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Módulos</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <a href="#">
                                        <LayoutDashboard className="size-4" />
                                        <span>Dashboard</span>
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                <a href="#">
                                    <Receipt className="size-4" />
                                    <span>Fluxo de Caixa</span>
                                </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link to="/pagamentos">
                                        <Wallet className="size-4" />
                                    <span>Pagamentos</span>           
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}