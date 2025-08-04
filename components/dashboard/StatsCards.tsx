import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Send, Users, Building } from "lucide-react";
import { DashboardStats } from "@/components/types/dashboard";

interface StatsCardsProps {
  stats: DashboardStats | null;
  showAdditional?: boolean;
}

export function StatsCards({ stats, showAdditional = false }: StatsCardsProps) {
  const mainStats = [
    {
      title: "Courrier entrant",
      value: stats?.totalMailsIn || 0,
      description: "Total des courriers reçus",
      icon: Mail,
    },
    // {
    //   title: "Courrier sortant",
    //   value: stats?.totalMailsOut || 0,
    //   description: "Total des courriers envoyés",
    //   icon: Send,
    // },
    {
      title: "Utilisateurs actifs",
      value: stats?.totalUsers || 0,
      description: "Utilisateurs dans le système",
      icon: Users,
    },
    {
      title: "Services",
      value: stats?.totalServices || 0,
      description: "Services municipaux",
      icon: Building,
    },
    {
      title: "Contacts entrants",
      value: stats?.totalContactsIn || 0,
      description: "Expéditeurs enregistrés",
      icon: Users,
    },
    // {
    //   title: "Contacts sortants",
    //   value: stats?.totalContactsOut || 0,
    //   description: "Destinataires enregistrés",
    //   icon: Send,
    // },
    {
      title: "Conseillers",
      value: stats?.totalCouncil || 0,
      description: "Conseillers municipaux",
      icon: Building,
    },
  ];

  return (
    <>
      {/* Statistiques principales */}
      <div className="flex justify-between gap-6 mb-8">
        {mainStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Statistiques supplémentaires */}
      {/* {showAdditional && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {additionalStats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )} */}
    </>
  );
}
