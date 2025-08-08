"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersTab } from "@/components/admin/users-tab";
import { ServicesTab } from "@/components/admin/services-tab";
import { CouncilTab } from "@/components/admin/council-tab";

export default function AdminPage() {
  return (
    <div className="flex h-screen w-full">
      <div className="flex-1 flex flex-col">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <h1 className="text-xl font-semibold">Administration</h1>
        </header>
        <main className="flex-1 p-4">
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="users">Utilisateurs</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="council">Élus</TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <UsersTab />
            </TabsContent>
            <TabsContent value="services">
              <ServicesTab />
            </TabsContent>
            <TabsContent value="council">
              <CouncilTab />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
