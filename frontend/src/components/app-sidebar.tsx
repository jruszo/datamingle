"use client"

import * as React from "react"
import {
  Database,
  Server,
  Cloud,
  Link,
  Key,
  Settings,
  Home,
} from "lucide-react"

import { NavMain } from "@/app/app/components/nav-main"
import { NavUser } from "@/app/app/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/app/app/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/app/dashboard",
      icon: Home,
      isActive: true,
    },
    {
      title: "Database Servers",
      url: "/app/database-servers",
      icon: Database,
    },
    {
      title: "Clusters",
      url: "/app/clusters",
      icon: Server,
    },
    {
      title: "Load Balancers",
      url: "/app/load-balancers",
      icon: Cloud,
    },
    {
      title: "Connections",
      url: "/app/connections",
      icon: Link,
    },
    {
      title: "Shard Keys",
      url: "/app/shard-keys",
      icon: Key,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings,
    },
  ],
}

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/app">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Database className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">DataMingle</span>
                  <span className="">v1.0.0</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
