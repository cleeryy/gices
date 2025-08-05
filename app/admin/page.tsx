"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/admin/app-sidebar";
import { UsersTab } from "@/components/admin/users-tab";
// import { ServicesTab } from "@/components/admin/services-tab";
// import { MailInTab } from "@/components/admin/mail-in-tab";
// import { CouncilTab } from "@/components/admin/council-tab";
// import { ContactsTab } from "@/components/admin/contacts-tab";

export default function AdminPage() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger />
            <h1 className="text-xl font-semibold">Administration</h1>
          </header>
          <main className="flex-1 overflow-auto p-4">
            <Tabs defaultValue="users" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="users">Utilisateurs</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="mail-in">Courrier entrant</TabsTrigger>
                <TabsTrigger value="council">Conseil</TabsTrigger>
                <TabsTrigger value="contacts">Contacts</TabsTrigger>
              </TabsList>

              <TabsContent value="users">
                <UsersTab />
              </TabsContent>
              {/* <TabsContent value="services">
                <ServicesTab />
              </TabsContent>
              <TabsContent value="mail-in">
                <MailInTab />
              </TabsContent>
              <TabsContent value="council">
                <CouncilTab />
              </TabsContent>
              <TabsContent value="contacts">
                <ContactsTab /> */}
              {/* </TabsContent> */}
            </Tabs>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
