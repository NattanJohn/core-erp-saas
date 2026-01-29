"use client";

import { useEffect, useState } from "react";
import { LayoutDashboard, Users, Settings, Package, LogOut, Building2, User } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AppSidebar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  // Garante que o componente só renderiza no cliente para evitar erros de hidratação
  useEffect(() => {
    setMounted(true);
  }, []);

  const slug = user?.tenant?.slug || "default";

  const navItems = [
    { title: "Dashboard", url: `/${slug}/dashboard`, icon: LayoutDashboard },
    { title: "Produtos", url: `/${slug}/products`, icon: Package },
    { title: "Clientes", url: `/${slug}/customers`, icon: Users },
    { title: "Configurações", url: `/${slug}/settings`, icon: Settings },
  ];

  const handleLogout = () => {
    Cookies.remove("auth-token");
    logout();
    router.push("/login");
  };

  if (!mounted) return null;

  return (
    <Sidebar collapsible="icon" className="border-r border-zinc-200 dark:border-zinc-800">
      <SidebarHeader className="pt-6 pb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-transparent cursor-default">
               <div>
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-zinc-900 text-white">
                    <Building2 className="size-5" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                    <span className="truncate font-semibold">
                      {user?.tenant?.name || "Empresa"}
                    </span>
                    <span className="truncate text-xs text-muted-foreground uppercase tracking-wider font-medium">
                      {slug}
                    </span>
                  </div>
               </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title}>
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg bg-zinc-100 text-zinc-900 text-xs font-bold">
                  {user?.name ? user.name.substring(0, 2).toUpperCase() : <User className="size-4" />}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user?.name || "Usuário"}</span>
                <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
              </div>
            </div>
            
            <SidebarMenuButton 
              onClick={handleLogout} 
              tooltip="Sair"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="size-4" />
              <span>Sair da conta</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}