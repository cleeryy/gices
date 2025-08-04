"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/admin/app-sidebar";
import { AdminContent } from "@/components/admin/AdminContent";
import { SiteHeader } from "@/components/admin/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalServices: number;
  totalContactsIn: number;
  totalContactsOut: number;
  totalCouncil: number;
  totalMailsIn: number;
  totalMailsOut: number;
  recentActivity: any[];
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>("overview");

  // Chargement des statistiques administrateur
  useEffect(() => {
    const loadAdminStats = async () => {
      if (!session) return;

      setLoading(true);
      setError(null);

      try {
        const [
          usersRes,
          servicesRes,
          contactsInRes,
          contactsOutRes,
          councilRes,
          mailsInRes,
          mailsOutRes,
        ] = await Promise.all([
          fetch("/api/users").then((r) => r.json()),
          fetch("/api/services").then((r) => r.json()),
          fetch("/api/contacts-in").then((r) => r.json()),
          fetch("/api/contacts-out").then((r) => r.json()),
          fetch("/api/council").then((r) => r.json()),
          fetch("/api/mail-in").then((r) => r.json()),
          fetch("/api/mail-out").then((r) => r.json()),
        ]);

        // Activité récente (dernières actions)
        const recentActivity = [
          ...(mailsInRes.success
            ? (mailsInRes.data?.data || []).slice(0, 5)
            : []),
          ...(mailsOutRes.success
            ? (mailsOutRes.data?.data || []).slice(0, 5)
            : []),
        ]
          .sort(
            (a, b) =>
              new Date(b.createdAt || b.date).getTime() -
              new Date(a.createdAt || a.date).getTime()
          )
          .slice(0, 10);

        setStats({
          totalUsers: usersRes.success
            ? usersRes.data?.pagination?.total ||
              (usersRes.data?.data || []).length
            : 0,
          totalServices: servicesRes.success
            ? (servicesRes.data?.data || []).length
            : 0,
          totalContactsIn: contactsInRes.success
            ? contactsInRes.data?.pagination?.total ||
              (contactsInRes.data?.data || []).length
            : 0,
          totalContactsOut: contactsOutRes.success
            ? contactsOutRes.data?.pagination?.total ||
              (contactsOutRes.data?.data || []).length
            : 0,
          totalCouncil: councilRes.success
            ? councilRes.data?.pagination?.total ||
              (councilRes.data?.data || []).length
            : 0,
          totalMailsIn: mailsInRes.success
            ? mailsInRes.data?.pagination?.total ||
              (mailsInRes.data?.data || []).length
            : 0,
          totalMailsOut: mailsOutRes.success
            ? mailsOutRes.data?.pagination?.total ||
              (mailsOutRes.data?.data || []).length
            : 0,
          recentActivity,
        });
      } catch (err) {
        console.error("Erreur chargement stats admin:", err);
        setError("Erreur lors du chargement des données administrateur");
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      loadAdminStats();
    }
  }, [session]);

  // États de chargement
  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-6">
          <CardContent className="flex items-center space-x-4">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p>Chargement de l'interface d'administration...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // Gestion des erreurs
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar
        onSectionChange={setActiveSection}
        activeSection={activeSection}
      />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <AdminContent
            activeSection={activeSection}
            stats={stats}
            onSectionChange={setActiveSection}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
