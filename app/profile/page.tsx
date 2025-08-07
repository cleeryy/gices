"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  User,
  Building,
  Mail,
  LogOut,
  Shield,
  Calendar,
  Clock,
  ArrowLeft,
  Settings,
  Edit,
} from "lucide-react";
import { IconLogout } from "@tabler/icons-react";

// Types pour les statistiques utilisateur
interface UserStats {
  mailsSent: number;
  mailsReceived: number;
  lastConnection: string;
  accountCreated: string;
  totalActivity: number;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Redirection si pas connecté
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // 🔥 CHARGEMENT DES STATISTIQUES RÉELLES
  useEffect(() => {
    const loadUserStats = async () => {
      if (!session?.user) return;

      setStatsLoading(true);
      setStatsError(null);

      try {
        const user = session.user as any;

        // Appels parallèles pour récupérer toutes les statistiques
        const [mailsOutRes, mailsInRes, userDetailRes] = await Promise.all([
          // Courriers envoyés par l'utilisateur
          fetch(`/api/mail-out?userId=${user.id}`).then((r) => r.json()),
          // Courriers entrants (pour calculer l'activité totale)
          fetch("/api/mail-in").then((r) => r.json()),
          // Détails de l'utilisateur depuis la base
          fetch(`/api/users/${user.id}`).then((r) => r.json()),
        ]);

        // Calculer les statistiques
        const mailsSent = mailsOutRes.success
          ? mailsOutRes.data?.pagination?.total ||
            (mailsOutRes.data?.data || mailsOutRes.data || []).length
          : 0;

        // Compter les courriers entrants où l'utilisateur apparaît (approximation de l'activité)
        const mailsInData = mailsInRes.success
          ? mailsInRes.data?.data || mailsInRes.data || []
          : [];
        const mailsReceived = mailsInData.filter((mail: any) =>
          mail.services?.some((s: any) => s.service?.id === user.serviceId)
        ).length;

        const totalActivity = mailsSent + mailsReceived;

        // Informations utilisateur réelles
        const userDetail = userDetailRes.success ? userDetailRes.data : null;
        const accountCreated =
          userDetail?.createdAt || new Date().toISOString();
        const lastConnection =
          userDetail?.updatedAt || new Date().toISOString();

        setUserStats({
          mailsSent,
          mailsReceived,
          lastConnection,
          accountCreated,
          totalActivity,
        });
      } catch (error) {
        console.error("Erreur chargement statistiques utilisateur:", error);
        setStatsError("Impossible de charger les statistiques");
      } finally {
        setStatsLoading(false);
      }
    };

    if (session?.user) {
      loadUserStats();
    }
  }, [session]);

  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/login",
      redirect: true,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatLastConnection = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 5) return "Maintenant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays} jour(s)`;
    return formatDate(dateString);
  };

  if (status === "loading") {
    return <ProfileSkeleton />;
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Alert className="max-w-md">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Vous devez être connecté pour accéder à cette page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>
            Erreur de session. Veuillez vous reconnecter.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const user = session.user as any;

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="flex w-full justify-between items-center">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Profil utilisateur</h2>
            <p className="text-muted-foreground">
              Gérez vos informations personnelles et vos préférences
            </p>
          </div>
          <div>
            <Button onClick={handleSignOut}>
              <IconLogout className="h-2 w-2" />
              <span>Se déconnecter</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profil Utilisateur */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <CardTitle>Informations personnelles</CardTitle>
                </div>
              </div>
              <CardDescription>
                Détails de votre compte utilisateur
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-xl font-semibold bg-primary/10 text-primary">
                    {user.firstName?.[0]}
                    {user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="text-2xl font-semibold">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-muted-foreground">
                    ID:{" "}
                    <code className="bg-muted px-2 py-1 rounded text-sm font-code">
                      {user.id}
                    </code>
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      En ligne
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Prénom
                  </label>
                  <pre className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg border">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{user.firstName}</span>
                  </pre>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Nom
                  </label>
                  <pre className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg border">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{user.lastName}</span>
                  </pre>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Email
                  </label>
                  <pre className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg border">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">
                      {user.email || "Non renseigné"}
                    </span>
                  </pre>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Identifiant
                  </label>
                  <pre className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg border">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <code className="font-mono text-foreground">{user.id}</code>
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service et informations supplémentaires */}
          <div className="space-y-6">
            {/* Service */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="h-5 w-5" />
                  <span>Service</span>
                </CardTitle>
                <CardDescription>Votre service d'affectation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.service ? (
                  <>
                    <div className="text-center p-6 bg-primary/5 rounded-lg border border-primary/20">
                      <Building className="h-12 w-12 mx-auto text-primary mb-3" />
                      <h3 className="font-semibold text-foreground text-lg mb-2">
                        {user.service.name}
                      </h3>
                      <Badge
                        variant="outline"
                        className="text-primary border-primary/50"
                      >
                        {user.service.code}
                      </Badge>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                        <span className="text-muted-foreground">
                          ID Service:
                        </span>
                        <span className="font-mono font-medium">
                          {user.service.id}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                        <span className="text-muted-foreground">Code:</span>
                        <span className="font-mono font-medium">
                          {user.service.code}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6 text-muted-foreground">
                    <Building className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Service non assigné</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 🔥 STATISTIQUES RÉELLES */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Statistiques</span>
                </CardTitle>
                <CardDescription>Votre activité sur GICES</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {statsLoading ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center"
                      >
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-5 w-12" />
                      </div>
                    ))}
                  </div>
                ) : statsError ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">{statsError}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Courriers envoyés
                      </span>
                      <Badge
                        variant="outline"
                        className="text-blue-600 border-blue-300"
                      >
                        {userStats?.mailsSent || 0}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Courriers traités
                      </span>
                      <Badge
                        variant="outline"
                        className="text-green-600 border-green-300"
                      >
                        {userStats?.mailsReceived || 0}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Activité totale
                      </span>
                      <Badge
                        variant="outline"
                        className="text-purple-600 border-purple-300"
                      >
                        {userStats?.totalActivity || 0}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Dernière connexion
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {userStats
                          ? formatLastConnection(userStats.lastConnection)
                          : "Maintenant"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Compte créé
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {userStats
                          ? formatDate(userStats.accountCreated)
                          : "Jan 2025"}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Session Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Informations de session</span>
            </CardTitle>
            <CardDescription>
              Détails techniques de votre connexion actuelle
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Statut de connexion
                </label>
                <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-green-700 dark:text-green-400 border-green-300 dark:border-green-600"
                  >
                    Connecté
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Type de session
                </label>
                <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg border">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">JWT Sécurisé</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Heure de connexion
                </label>
                <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg border">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {new Date().toLocaleString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

// Composant de skeleton pour le chargement (inchangé)
function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-6 w-16" />
            </div>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-32" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
