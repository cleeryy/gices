"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils"; // Assumes you have a cn utility for classnames

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Bell, Building } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Session } from "next-auth";
import { IconLogin } from "@tabler/icons-react";

interface HeaderProps {
  title?: string;
  onNotificationClick?: () => void;
}

export function Header({ title = "GICES", onNotificationClick }: HeaderProps) {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<Session | null>();
  const pathname = usePathname();

  useEffect(() => {
    setUserData(session);
  }, [status]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card">
      <div className="flex px-10 h-16 justify-around items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Building className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">{title}</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/dashboard"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname.startsWith("/dashboard")
                  ? "text-foreground"
                  : "text-foreground/60"
              )}
            >
              Dashboard
            </Link>
            <Link
              href="/historique"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === "/historique"
                  ? "text-foreground"
                  : "text-foreground/60"
              )}
            >
              Historique
            </Link>
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <ThemeToggle />
          {status !== "unauthenticated" ? (
            <Link href="/profile">
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarFallback className="text-sm">
                  {userData?.user?.name?.split(" ")[0][0].toUpperCase()}
                  {userData?.user?.name?.split(" ")[1][0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="sr-only">Profile</span>
            </Link>
          ) : (
            <Link href={"/login"}>
              <Button>
                <IconLogin className="h-2 w-2" />
                <span>Se connecter</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
