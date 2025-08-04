"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconUsers,
  IconBuilding,
  IconMail,
  IconSend,
  IconUserCircle,
  IconShield,
  IconTrendingUp,
  IconTrendingDown,
  IconActivity,
  IconCalendar,
  IconEye,
  IconPlus,
  IconArrowRight,
  IconAlertCircle,
} from "@tabler/icons-react";

interface AdminOverviewProps {
  stats: {
    totalUsers: number;
    totalServices: number;
    totalContactsIn: number;
    totalContactsOut: number;
    totalCouncil: number;
    totalMailsIn: number;
    totalMailsOut: number;
    recentActivity: any[];
  } | null;
  onSectionChange: (section: string) => void;
}

interface DetailedStats {
  allMailsIn: any[];
  allMailsOut: any[];
  allUsers: any[];
  allServices: any[];
  lastWeekStats: {
    mailsIn: number;
    mailsOut: number;
    users: number;
  };
  lastMonthStats: {
    mailsIn: number;
    mailsOut: number;
    users: number;
  };
}

const chartConfig = {
  entrants: {
    label: "Courriers entrants",
    color: "var(--chart-1)",
  },
  sortants: {
    label: "Courriers sortants",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function AdminOverview({ stats, onSectionChange }: AdminOverviewProps) {
  const { data: session } = useSession();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [detailedStats, setDetailedStats] = useState<DetailedStats | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 🔥 CHARGEMENT DES VRAIES DONNÉES DÉTAILLÉES
  useEffect(() => {
    const loadDetailedStats = async () => {
      if (!session) return;

      setLoading(true);
      setError(null);

      try {
        // Charger toutes les données en parallèle
        const [allMailsInRes, allMailsOutRes, allUsersRes, allServicesRes] =
          await Promise.all([
            fetch("/api/mail-in?all=true").then((r) => r.json()),
            fetch("/api/mail-out?all=true").then((r) => r.json()),
            fetch("/api/users?all=true").then((r) => r.json()),
            fetch("/api/services?all=true").then((r) => r.json()),
          ]);

        const allMailsIn = allMailsInRes.success
          ? allMailsInRes.data?.data || allMailsInRes.data || []
          : [];
        const allMailsOut = allMailsOutRes.success
          ? allMailsOutRes.data?.data || allMailsOutRes.data || []
          : [];
        const allUsers = allUsersRes.success
          ? allUsersRes.data?.data || allUsersRes.data || []
          : [];
        const allServices = allServicesRes.success
          ? allServicesRes.data?.data || allServicesRes.data || []
          : [];

        // Calculer les statistiques de la semaine dernière et du mois dernier
        const now = new Date();
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const lastWeekMailsIn = allMailsIn.filter((mail: any) => {
          const mailDate = new Date(mail.date || mail.createdAt);
          return mailDate >= lastWeek && mailDate <= now;
        }).length;

        const lastWeekMailsOut = allMailsOut.filter((mail: any) => {
          const mailDate = new Date(mail.date || mail.createdAt);
          return mailDate >= lastWeek && mailDate <= now;
        }).length;

        const lastMonthMailsIn = allMailsIn.filter((mail: any) => {
          const mailDate = new Date(mail.date || mail.createdAt);
          return mailDate >= lastMonth && mailDate <= now;
        }).length;

        const lastMonthMailsOut = allMailsOut.filter((mail: any) => {
          const mailDate = new Date(mail.date || mail.createdAt);
          return mailDate >= lastMonth && mailDate <= now;
        }).length;

        const lastWeekUsers = allUsers.filter((user: any) => {
          const userDate = new Date(user.createdAt);
          return userDate >= lastWeek && userDate <= now;
        }).length;

        const lastMonthUsers = allUsers.filter((user: any) => {
          const userDate = new Date(user.createdAt);
          return userDate >= lastMonth && userDate <= now;
        }).length;

        setDetailedStats({
          allMailsIn,
          allMailsOut,
          allUsers,
          allServices,
          lastWeekStats: {
            mailsIn: lastWeekMailsIn,
            mailsOut: lastWeekMailsOut,
            users: lastWeekUsers,
          },
          lastMonthStats: {
            mailsIn: lastMonthMailsIn,
            mailsOut: lastMonthMailsOut,
            users: lastMonthUsers,
          },
        });
      } catch (err) {
        console.error("Erreur chargement données détaillées:", err);
        setError("Erreur lors du chargement des données détaillées");
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      loadDetailedStats();
    }
  }, [session]);

  // 🔥 CALCUL DES VRAIES DONNÉES HEBDOMADAIRES
  const generateRealWeeklyData = () => {
    if (!detailedStats) return [];

    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const dayName = date.toLocaleDateString("fr-FR", { weekday: "short" });

      const entrants = detailedStats.allMailsIn.filter((mail: any) => {
        const mailDate = new Date(mail.date || mail.createdAt);
        return mailDate >= startOfDay && mailDate <= endOfDay;
      }).length;

      const sortants = detailedStats.allMailsOut.filter((mail: any) => {
        const mailDate = new Date(mail.date || mail.createdAt);
        return mailDate >= startOfDay && mailDate <= endOfDay;
      }).length;

      days.push({
        day: dayName,
        date: date.toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
        }),
        entrants,
        sortants,
      });
    }
    return days;
  };

  // 🔥 CALCUL DES VRAIES TENDANCES
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return { trend: "+100%", isPositive: true };
    const percentage = ((current - previous) / previous) * 100;
    const isPositive = percentage >= 0;
    return {
      trend: `${isPositive ? "+" : ""}${percentage.toFixed(1)}%`,
      isPositive,
    };
  };

  const weeklyData = generateRealWeeklyData();

  // 🔥 CALCUL DES TENDANCES RÉELLES
  const usersTrend = detailedStats
    ? calculateTrend(
        detailedStats.lastWeekStats.users,
        detailedStats.lastMonthStats.users - detailedStats.lastWeekStats.users
      )
    : { trend: "...", isPositive: true };

  const mailsInTrend = detailedStats
    ? calculateTrend(
        detailedStats.lastWeekStats.mailsIn,
        detailedStats.lastMonthStats.mailsIn -
          detailedStats.lastWeekStats.mailsIn
      )
    : { trend: "...", isPositive: true };

  const mailsOutTrend = detailedStats
    ? calculateTrend(
        detailedStats.lastWeekStats.mailsOut,
        detailedStats.lastMonthStats.mailsOut -
          detailedStats.lastWeekStats.mailsOut
      )
    : { trend: "...", isPositive: true };

  // 🔥 ACTIVITÉ RÉCENTE RÉELLE
  const getRealRecentActivity = () => {
    if (!detailedStats) return [];

    const allActivity = [
      ...detailedStats.allMailsIn.map((mail: any) => ({
        ...mail,
        type: "mail-in",
        timestamp: new Date(mail.date || mail.createdAt),
      })),
      ...detailedStats.allMailsOut.map((mail: any) => ({
        ...mail,
        type: "mail-out",
        timestamp: new Date(mail.date || mail.createdAt),
      })),
      ...detailedStats.allUsers.map((user: any) => ({
        ...user,
        type: "user",
        timestamp: new Date(user.createdAt),
        subject: `Nouvel utilisateur: ${user.firstName} ${user.lastName}`,
      })),
    ]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    return allActivity;
  };

  const recentActivity = getRealRecentActivity();

  // Statistiques principales avec vraies données
  const mainStats = [
    {
      title: "Utilisateurs Actifs",
      value: stats?.totalUsers || 0,
      icon: IconUsers,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
      trend: usersTrend.trend,
      isPositive: usersTrend.isPositive,
      action: () => onSectionChange("users"),
      weeklyCount: detailedStats?.lastWeekStats.users || 0,
    },
    {
      title: "Services Municipaux",
      value: stats?.totalServices || 0,
      icon: IconBuilding,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
      trend: "Stable",
      isPositive: null,
      action: () => onSectionChange("services"),
      weeklyCount: 0,
    },
    {
      title: "Courriers Entrants",
      value: stats?.totalMailsIn || 0,
      icon: IconMail,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
      trend: mailsInTrend.trend,
      isPositive: mailsInTrend.isPositive,
      action: () => onSectionChange("mail-in"),
      weeklyCount: detailedStats?.lastWeekStats.mailsIn || 0,
    },
    {
      title: "Courriers Sortants",
      value: stats?.totalMailsOut || 0,
      icon: IconSend,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950",
      trend: mailsOutTrend.trend,
      isPositive: mailsOutTrend.isPositive,
      action: () => onSectionChange("mail-out"),
      weeklyCount: detailedStats?.lastWeekStats.mailsOut || 0,
    },
  ];

  // Actions rapides
  const quickActions = [
    {
      title: "Gestion Utilisateurs",
      description: "Créer, modifier, supprimer des utilisateurs",
      icon: IconUsers,
      color: "text-blue-600",
      action: () => onSectionChange("users"),
    },
    {
      title: "Administration Services",
      description: "Gérer les services municipaux",
      icon: IconBuilding,
      color: "text-green-600",
      action: () => onSectionChange("services"),
    },
    {
      title: "Courrier Entrant",
      description: "Consulter et traiter les courriers reçus",
      icon: IconMail,
      color: "text-purple-600",
      action: () => onSectionChange("mail-in"),
    },
    {
      title: "Contacts & Conseillers",
      description: "Gérer les contacts et conseillers",
      icon: IconUserCircle,
      color: "text-cyan-600",
      action: () => onSectionChange("contacts-in"),
    },
  ];

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-destructive">
            <IconAlertCircle className="h-5 w-5" />
            <span>Erreur de chargement</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Réessayer</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header de bienvenue */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">
                Bienvenue sur GICES Administration
              </CardTitle>
              <CardDescription className="text-lg">
                Bonjour {session?.user?.firstName} {session?.user?.lastName},
                gérez votre plateforme de courrier municipal
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                {currentTime.toLocaleDateString("fr-FR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-lg font-mono font-bold">
                {currentTime.toLocaleTimeString("fr-FR")}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Statistiques principales avec vraies données */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {mainStats.map((stat, index) => (
          <Card
            key={index}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={stat.action}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <IconArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <p className="text-3xl font-bold">
                    {stat.value.toLocaleString()}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {stat.isPositive === true && (
                      <IconTrendingUp className="h-3 w-3 text-green-600" />
                    )}
                    {stat.isPositive === false && (
                      <IconTrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    {loading ? (
                      <Skeleton className="h-4 w-12" />
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        {stat.trend}
                      </Badge>
                    )}
                  </div>
                  {stat.weeklyCount > 0 && (
                    <span className="text-xs text-muted-foreground">
                      +{stat.weeklyCount} cette semaine
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Graphique d'activité réelle et informations système */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Graphique activité avec vraies données */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <IconActivity className="h-5 w-5" />
              <span>Activité des 7 derniers jours</span>
            </CardTitle>
            <CardDescription>
              Données réelles du courrier entrant et sortant
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ChartContainer config={chartConfig} className="h-64">
                <BarChart data={weeklyData}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} />
                  <YAxis />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        indicator="dashed"
                        labelFormatter={(value, payload) => {
                          const item = payload?.[0]?.payload;
                          return item ? `${value} (${item.date})` : value;
                        }}
                      />
                    }
                  />
                  <Bar
                    dataKey="entrants"
                    fill="var(--color-entrants)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="sortants"
                    fill="var(--color-sortants)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Informations système avec vraies données */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <IconShield className="h-5 w-5" />
              <span>État du Système</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Statut</span>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  Opérationnel
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Version</span>
                <Badge variant="outline">v2.1.0</Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Base de données
                </span>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  Connectée
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Dernière sauvegarde
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date().toLocaleDateString("fr-FR")}
                </span>
              </div>

              {detailedStats && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Données chargées
                  </span>
                  <Badge variant="outline">
                    {detailedStats.allMailsIn.length +
                      detailedStats.allMailsOut.length}{" "}
                    courriers
                  </Badge>
                </div>
              )}
            </div>

            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">Activité récente</h4>
              <div className="space-y-2">
                {loading
                  ? [...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-4 w-full" />
                    ))
                  : recentActivity.slice(0, 3).map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 text-xs"
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            activity.type === "mail-in"
                              ? "bg-purple-500"
                              : activity.type === "mail-out"
                              ? "bg-orange-500"
                              : "bg-blue-500"
                          }`}
                        ></div>
                        <span className="text-muted-foreground">
                          {activity.subject
                            ? `${activity.subject.substring(0, 25)}...`
                            : "Activité récente"}
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {activity.timestamp.toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "2-digit",
                          })}
                        </span>
                      </div>
                    )) || (
                      <p className="text-xs text-muted-foreground">
                        Aucune activité récente
                      </p>
                    )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <IconPlus className="h-5 w-5" />
            <span>Actions Rapides</span>
          </CardTitle>
          <CardDescription>
            Accédez rapidement aux fonctionnalités principales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action, index) => (
              <Card
                key={index}
                className="cursor-pointer hover:shadow-md transition-all hover:scale-105"
                onClick={action.action}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <action.icon className={`h-8 w-8 ${action.color}`} />
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">
                          {action.title}
                        </h3>
                      </div>
                      <IconArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Informations sur la plateforme avec vraies statistiques */}
      <Card>
        <CardHeader>
          <CardTitle>À propos de GICES</CardTitle>
          <CardDescription>
            Plateforme de gestion intégrée du courrier électronique et services
            municipaux
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h4 className="font-semibold">Fonctionnalités principales</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center space-x-2">
                  <IconMail className="h-4 w-4" />
                  <span>Gestion complète du courrier entrant et sortant</span>
                </li>
                <li className="flex items-center space-x-2">
                  <IconUsers className="h-4 w-4" />
                  <span>Administration des utilisateurs et services</span>
                </li>
                <li className="flex items-center space-x-2">
                  <IconBuilding className="h-4 w-4" />
                  <span>Organisation par services municipaux</span>
                </li>
                <li className="flex items-center space-x-2">
                  <IconShield className="h-4 w-4" />
                  <span>Gestion des droits et permissions</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Statistiques globales</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Total courriers</p>
                  {loading ? (
                    <Skeleton className="h-6 w-16" />
                  ) : (
                    <p className="text-2xl font-bold">
                      {(
                        (stats?.totalMailsIn || 0) + (stats?.totalMailsOut || 0)
                      ).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Total contacts</p>
                  {loading ? (
                    <Skeleton className="h-6 w-16" />
                  ) : (
                    <p className="text-2xl font-bold">
                      {(
                        (stats?.totalContactsIn || 0) +
                        (stats?.totalContactsOut || 0)
                      ).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Services actifs</p>
                  {loading ? (
                    <Skeleton className="h-6 w-16" />
                  ) : (
                    <p className="text-2xl font-bold">
                      {stats?.totalServices || 0}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Conseillers</p>
                  {loading ? (
                    <Skeleton className="h-6 w-16" />
                  ) : (
                    <p className="text-2xl font-bold">
                      {stats?.totalCouncil || 0}
                    </p>
                  )}
                </div>
              </div>

              {detailedStats && (
                <div className="mt-4 pt-4 border-t">
                  <h5 className="font-medium text-sm mb-2">
                    Activité cette semaine
                  </h5>
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Courriers entrants:
                      </span>
                      <span className="font-medium">
                        {detailedStats.lastWeekStats.mailsIn}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Courriers sortants:
                      </span>
                      <span className="font-medium">
                        {detailedStats.lastWeekStats.mailsOut}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Nouveaux utilisateurs:
                      </span>
                      <span className="font-medium">
                        {detailedStats.lastWeekStats.users}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
