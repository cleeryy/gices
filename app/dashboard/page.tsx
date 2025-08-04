"use client";

import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Components
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { WelcomeSection } from "@/components/dashboard/WelcomeSection";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { ChartsSection } from "@/components/dashboard/ChartsSection";
import { RecentMailsSection } from "@/components/dashboard/RecentMailsSection";
import { MailViewDialog } from "@/components/dashboard/dialogs/MailViewDialog";
import { DashboardSkeleton } from "@/components/ui/DashboardSkeleton";

// Types
import {
  DashboardStats,
  ViewMailDialog,
  ServiceData,
  ContactData,
} from "@/components/types/dashboard";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // États pour les dialogs
  const [viewMailDialog, setViewMailDialog] = useState<ViewMailDialog>({
    open: false,
    mail: null,
    type: "in",
  });

  // Données pour les selects
  const [services, setServices] = useState<ServiceData[]>([]);
  const [contactsIn, setContactsIn] = useState<ContactData[]>([]);
  const [contactsOut, setContactsOut] = useState<ContactData[]>([]);
  const [council, setCouncil] = useState<any[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Chargement des données pour les selects
  useEffect(() => {
    const loadSelectData = async () => {
      try {
        const [servicesRes, contactsInRes, contactsOutRes, councilRes] =
          await Promise.all([
            fetch("/api/services").then((r) => r.json()),
            fetch("/api/contacts-in").then((r) => r.json()),
            fetch("/api/contacts-out").then((r) => r.json()),
            fetch("/api/council").then((r) => r.json()),
          ]);

        setServices(
          servicesRes.success
            ? servicesRes.data?.data || servicesRes.data || []
            : []
        );
        setContactsIn(
          contactsInRes.success
            ? contactsInRes.data?.data || contactsInRes.data || []
            : []
        );
        setContactsOut(
          contactsOutRes.success
            ? contactsOutRes.data?.data || contactsOutRes.data || []
            : []
        );
        setCouncil(
          councilRes.success
            ? councilRes.data?.data || councilRes.data || []
            : []
        );
      } catch (error) {
        console.error("Erreur chargement données select:", error);
      }
    };

    if (session) {
      loadSelectData();
    }
  }, [session]);

  // Chargement des statistiques
  useEffect(() => {
    const loadRealStats = async () => {
      if (!session) return;

      setLoading(true);
      setError(null);

      try {
        const [
          mailsInRes,
          mailsOutRes,
          usersRes,
          servicesRes,
          contactsInRes,
          contactsOutRes,
          councilRes,
        ] = await Promise.all([
          fetch("/api/mail-in").then((r) => r.json()),
          fetch("/api/mail-out").then((r) => r.json()),
          fetch("/api/users").then((r) => r.json()),
          fetch("/api/services").then((r) => r.json()),
          fetch("/api/contacts-in").then((r) => r.json()),
          fetch("/api/contacts-out").then((r) => r.json()),
          fetch("/api/council").then((r) => r.json()),
        ]);

        const [recentMailsInRes, recentMailsOutRes] = await Promise.all([
          fetch("/api/mail-in?limit=5").then((r) => r.json()),
          fetch("/api/mail-out?limit=5").then((r) => r.json()),
        ]);

        const [allMailsInRes, allMailsOutRes] = await Promise.all([
          fetch("/api/mail-in").then((r) => r.json()), // Sans limit pour avoir TOUS les mails
          fetch("/api/mail-out").then((r) => r.json()), // Sans limit pour avoir TOUS les mails
        ]);

        const servicesData = servicesRes.success
          ? servicesRes.data?.data || servicesRes.data || []
          : [];
        const mailsInData = mailsInRes.success
          ? mailsInRes.data?.data || mailsInRes.data || []
          : [];
        const mailsOutData = mailsOutRes.success
          ? mailsOutRes.data?.data || mailsOutRes.data || []
          : [];

        const serviceStats = servicesData
          .map((service: any) => {
            const serviceMailCount = mailsInData.filter((mail: any) =>
              mail.services?.some((s: any) => s.service?.id === service.id)
            ).length;

            return {
              name: service.code,
              value: serviceMailCount,
              fullName: service.name,
              color: getServiceColor(service.code),
            };
          })
          .filter((s: any) => s.value > 0);

        const monthlyTrends = calculateRealMonthlyTrends(
          mailsInData,
          mailsOutData
        );

        setStats({
          totalMailsIn: mailsInRes.success
            ? mailsInRes.data?.pagination?.total || mailsInData.length
            : 0,
          totalMailsOut: mailsOutRes.success
            ? mailsOutRes.data?.pagination?.total || mailsOutData.length
            : 0,
          allMailsIn: allMailsInRes.success
            ? allMailsInRes.data?.data || allMailsInRes.data || []
            : [],
          allMailsOut: allMailsOutRes.success
            ? allMailsOutRes.data?.data || allMailsOutRes.data || []
            : [],
          totalUsers: usersRes.success
            ? usersRes.data?.pagination?.total ||
              (usersRes.data?.data || usersRes.data || []).length
            : 0,
          totalServices: servicesRes.success ? servicesData.length : 0,
          totalContactsIn: contactsInRes.success
            ? contactsInRes.data?.pagination?.total ||
              (contactsInRes.data?.data || contactsInRes.data || []).length
            : 0,
          totalContactsOut: contactsOutRes.success
            ? contactsOutRes.data?.pagination?.total ||
              (contactsOutRes.data?.data || contactsOutRes.data || []).length
            : 0,
          totalCouncil: councilRes.success
            ? councilRes.data?.pagination?.total ||
              (councilRes.data?.data || councilRes.data || []).length
            : 0,
          recentMailsIn: recentMailsInRes.success
            ? (
                recentMailsInRes.data?.data ||
                recentMailsInRes.data ||
                []
              ).slice(0, 5)
            : [],
          recentMailsOut: recentMailsOutRes.success
            ? (
                recentMailsOutRes.data?.data ||
                recentMailsOutRes.data ||
                []
              ).slice(0, 5)
            : [],
          serviceStats,
          monthlyTrends,
        });
      } catch (err) {
        console.error("Erreur chargement stats:", err);
        setError("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      loadRealStats();
    }
  }, [session]);

  // Fonctions helper
  const getServiceColor = (code: string) => {
    const colors = [
      "hsl(var(--primary))",
      "hsl(var(--secondary))",
      "hsl(var(--accent))",
      "hsl(var(--destructive))",
      "hsl(var(--muted))",
      "hsl(var(--success))",
      "hsl(var(--warning))",
      "hsl(var(--info))",
    ];
    const index = code.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const calculateRealMonthlyTrends = (mailsIn: any[], mailsOut: any[]) => {
    const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin"];
    const currentDate = new Date();

    return months.map((month, index) => {
      const monthDate = new Date(currentDate.getFullYear(), index, 1);
      const nextMonthDate = new Date(currentDate.getFullYear(), index + 1, 1);

      const entrants = mailsIn.filter((mail) => {
        const mailDate = new Date(mail.date || mail.createdAt);
        return mailDate >= monthDate && mailDate < nextMonthDate;
      }).length;

      const sortants = mailsOut.filter((mail) => {
        const mailDate = new Date(mail.date || mail.createdAt);
        return mailDate >= monthDate && mailDate < nextMonthDate;
      }).length;

      return { month, entrants, sortants };
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handlers
  const handleViewMail = (mail: any, type: "in" | "out") => {
    setViewMailDialog({ open: true, mail, type });
  };

  const handleCloseViewDialog = () => {
    setViewMailDialog({ open: false, mail: null, type: "in" });
  };

  const handleMailCreated = () => {
    window.location.reload();
  };

  const handleMailUpdated = () => {
    window.location.reload();
  };

  if (status === "loading" || loading) {
    return <DashboardSkeleton />;
  }

  if (!session) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Erreur</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const user = session.user as any;

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-3/4 mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <WelcomeSection
          title="Tableau de bord"
          description="voici un aperçu de l'activité de GICES"
          userName={user.firstName}
        />

        <QuickActions
          services={services}
          contactsIn={contactsIn}
          contactsOut={contactsOut}
          council={council}
          onProfileClick={() => router.push("/profile")}
          onAdvancedManagementClick={
            () => redirect("/historique")
            // window.open("/tests/mail-in", "_blank")
          }
          onMailCreated={handleMailCreated}
        />

        <StatsCards stats={stats} showAdditional={true} />

        <ChartsSection stats={stats} />

        <RecentMailsSection
          stats={stats}
          formatDate={formatDate}
          onViewMail={handleViewMail}
        />

        <MailViewDialog
          viewDialog={viewMailDialog}
          formatDate={formatDate}
          onClose={handleCloseViewDialog}
          onUpdate={handleMailUpdated}
        />
      </main>
    </div>
  );
}
