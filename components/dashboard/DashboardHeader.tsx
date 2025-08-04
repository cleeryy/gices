"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Bell, Building } from "lucide-react";
import { usePathname } from "next/navigation";

interface DashboardHeaderProps {
  user?: {
    firstName?: string;
    lastName?: string;
  };
  title?: string;
  badgeText?: string;
  onProfileClick?: () => void;
  onNotificationClick?: () => void;
}

export function DashboardHeader({
  user,
  title = "GICES",
  onProfileClick,
  onNotificationClick,
}: DashboardHeaderProps) {
  const pathname = usePathname().split("/");
  const badgePathname = pathname[pathname.length - 1];

  return (
    <header className="border-b bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Building className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">{title}</h1>
            </div>
            <Badge variant="default">
              {badgePathname[0].toUpperCase() + badgePathname.slice(1)}
            </Badge>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={onNotificationClick}>
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onProfileClick}>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-sm">
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
