import { LayoutDashboard, Map, CloudRain, FileCheck, Bot, BarChart3, Trees, Globe2 } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Forest Map", url: "/map", icon: Map },
  { title: "Weather & Risk", url: "/weather", icon: CloudRain },
  { title: "Claim Credits", url: "/claims", icon: FileCheck },
  { title: "AI Advisor", url: "/ai-advisor", icon: Bot },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Bhuvan", url: "/bhuvan", icon: Globe2 },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <Trees className="h-7 w-7 text-sidebar-primary" />
          {!collapsed && (
            <div>
              <h2 className="text-base font-bold tracking-tight text-sidebar-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                VanCC
              </h2>
              <p className="text-[10px] text-sidebar-foreground/60">Forest Carbon Credits</p>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <NavLink to={item.url} end className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
