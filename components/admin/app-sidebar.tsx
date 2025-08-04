"use client";

import * as React from "react";
import {
  IconUsers,
  IconBuilding,
  IconMail,
  IconSend,
  IconUserCircle,
  IconSettings,
  IconDashboard,
  IconDatabase,
  IconReport,
  IconChartArea,
  IconShield,
  IconBell,
  IconHelp,
  IconSearch,
} from "@tabler/icons-react";
import { NavDocuments } from "@/components/admin/nav-documents";
import { NavMain } from "@/components/admin/nav-main";
import { NavSecondary } from "@/components/admin/nav-secondary";
import { NavUser } from "@/components/admin/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";

interface AppSidebarProps {
  onSectionChange: (section: string) => void;
  activeSection: string;
}

export function AppSidebar({
  onSectionChange,
  activeSection,
  ...props
}: AppSidebarProps & React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();

  const data = {
    user: {
      name:
        session?.user?.firstName + " " + session?.user?.lastName ||
        "Administrateur",
      email: session?.user?.email || "admin@gices.fr",
      avatar: "/avatars/admin.jpg",
    },
    navMain: [
      {
        title: "Vue d'ensemble",
        url: "#",
        icon: IconDashboard,
        onClick: () => onSectionChange("overview"),
        isActive: activeSection === "overview",
      },
      {
        title: "Utilisateurs",
        url: "#",
        icon: IconUsers,
        onClick: () => onSectionChange("users"),
        isActive: activeSection === "users",
      },
      {
        title: "Services",
        url: "#",
        icon: IconBuilding,
        onClick: () => onSectionChange("services"),
        isActive: activeSection === "services",
      },
      {
        title: "Courrier Entrant",
        url: "#",
        icon: IconMail,
        onClick: () => onSectionChange("mail-in"),
        isActive: activeSection === "mail-in",
      },
    ],
    navManagement: [
      {
        name: "Contacts Entrants",
        icon: IconUserCircle,
        url: "#",
        onClick: () => onSectionChange("contacts-in"),
      },
      {
        name: "Conseillers",
        icon: IconShield,
        url: "#",
        onClick: () => onSectionChange("council"),
      },
    ],
    navSecondary: [
      {
        title: "Paramètres",
        url: "#",
        icon: IconSettings,
        onClick: () => onSectionChange("settings"),
      },
      {
        title: "Aide",
        url: "#",
        icon: IconHelp,
        onClick: () => {
          open(
            "mailto:clery.arqueferradou@gmail.com?subject=Besoin%20d'aide%20sur%20GICES&body=Bonjour%20Cl%C3%A9ry!%0D%0A%0D%0AJ'ai%20besoin%20d'aide%20sur%20GICES%20%C3%A0%20propos%20de%20ce%20probl%C3%A8me%20%3A%0D%0APROBLEME%0D%0A%0D%0AC'est%20au%20niveau%20d'urgence%20%3A%0D%0AX%2F5%0D%0A%0D%0AVoici%20une%20courte%20description%20du%20probl%C3%A8me%20et%20%2F%20ou%20remarques%20%3A%0D%0ADESCRIPTION%20ET%20%2F%20OU%20REMARQUES%0D%0A%0D%0AMerci%2C%20bonne%20journ%C3%A9e.%0D%0ACordialement%2C%0D%0A%0D%0APr%C3%A9nom%20NOM"
          );
        },
      },
    ],
    navTools: [
      {
        name: "Base de données",
        url: "#",
        icon: IconDatabase,
        onClick: () => onSectionChange("database"),
      },
      {
        name: "Rapports",
        url: "#",
        icon: IconReport,
        onClick: () => onSectionChange("reports"),
      },
      {
        name: "Statistiques",
        url: "#",
        icon: IconChartArea,
        onClick: () => onSectionChange("analytics"),
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div
                className="cursor-pointer"
                onClick={() => onSectionChange("overview")}
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <IconShield className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="font-semibold">GICES Admin</span>
                  <span className="text-xs">Interface d'administration</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments title="Gestion" items={data.navManagement} />
        {/* <NavDocuments title="Outils" items={data.navTools} /> */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
