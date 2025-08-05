"use client"

import { 
  Database, 
  FileText, 
  Users, 
  Settings, 
  Bell, 
  Home,
  Calendar,
  BarChart3,
  Shield,
  Workflow
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import Link from "next/link"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/app",
      icon: Home,
    },
    {
      title: "Database Management",
      items: [
        {
          title: "Database Inventory",
          url: "/app/databases",
          icon: Database,
        },
        {
          title: "Query Executor",
          url: "/app/queries",
          icon: FileText,
        },
        {
          title: "Data Exports",
          url: "/app/exports",
          icon: BarChart3,
        },
      ],
    },
    {
      title: "Requests",
      items: [
        {
          title: "My Requests",
          url: "/app/requests/my",
          icon: FileText,
        },
        {
          title: "Pending Approvals",
          url: "/app/requests/pending",
          icon: Calendar,
        },
        {
          title: "Request History",
          url: "/app/requests/history",
          icon: Calendar,
        },
      ],
    },
    {
      title: "Administration",
      items: [
        {
          title: "User Management",
          url: "/app/admin/users",
          icon: Users,
        },
        {
          title: "Permission Requests",
          url: "/app/admin/permissions",
          icon: Shield,
        },
        {
          title: "Audit Workflows",
          url: "/app/admin/workflows",
          icon: Workflow,
        },
      ],
    },
    {
      title: "Settings",
      items: [
        {
          title: "Profile Settings",
          url: "/app/settings/profile",
          icon: Settings,
        },
        {
          title: "Notification Settings",
          url: "/app/settings/notifications",
          icon: Bell,
        },
      ],
    },
  ],
}

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.items ? (
                    <>
                      <SidebarMenuButton asChild>
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                      <SidebarMenu>
                        {item.items.map((subItem) => (
                          <SidebarMenuItem key={subItem.title}>
                            <SidebarMenuButton asChild>
                              <Link href={subItem.url}>
                                <subItem.icon className="h-4 w-4" />
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </>
                  ) : (
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
