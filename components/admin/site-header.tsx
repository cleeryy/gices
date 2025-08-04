"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";

export function SiteHeader() {
  const { data: session } = useSession();

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">Administration GICES</h1>
          <Badge variant="secondary">
            {session?.user?.firstName} {session?.user?.lastName}
          </Badge>
        </div>
      </div>
    </header>
  );
}
