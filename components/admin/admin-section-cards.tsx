import {
  IconTrendingUp,
  IconTrendingDown,
  IconUsers,
  IconBuilding,
  IconMail,
  IconSend,
  IconUserCircle,
  IconShield,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AdminSectionCardsProps {
  stats: {
    totalUsers: number;
    totalServices: number;
    totalContactsIn: number;
    totalContactsOut: number;
    totalCouncil: number;
    totalMailsIn: number;
    totalMailsOut: number;
  } | null;
}

export function AdminSectionCards({ stats }: AdminSectionCardsProps) {
  const cards = [
    {
      title: "Utilisateurs",
      value: stats?.totalUsers || 0,
      description: "Utilisateurs actifs dans GICES",
      trend: "+12%",
      trendUp: true,
      icon: IconUsers,
      color: "text-blue-600",
    },
    {
      title: "Services",
      value: stats?.totalServices || 0,
      description: "Services municipaux",
      trend: "Stable",
      trendUp: null,
      icon: IconBuilding,
      color: "text-green-600",
    },
    {
      title: "Courriers Entrants",
      value: stats?.totalMailsIn || 0,
      description: "Total reçus",
      trend: "+8%",
      trendUp: true,
      icon: IconMail,
      color: "text-purple-600",
    },
    {
      title: "Courriers Sortants",
      value: stats?.totalMailsOut || 0,
      description: "Total envoyés",
      trend: "+15%",
      trendUp: true,
      icon: IconSend,
      color: "text-orange-600",
    },
    {
      title: "Contacts Entrants",
      value: stats?.totalContactsIn || 0,
      description: "Expéditeurs enregistrés",
      trend: "+5%",
      trendUp: true,
      icon: IconUserCircle,
      color: "text-cyan-600",
    },
    {
      title: "Conseillers",
      value: stats?.totalCouncil || 0,
      description: "Conseillers municipaux",
      trend: "Stable",
      trendUp: null,
      icon: IconShield,
      color: "text-indigo-600",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardAction className="pb-2">
            <div className="text-2xl font-bold">
              {card.value.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardAction>
          <CardFooter>
            <div className="flex items-center gap-2 text-xs">
              {card.trendUp === true && (
                <>
                  <IconTrendingUp className="h-3 w-3 text-green-600" />
                  <Badge variant="secondary" className="text-green-600">
                    {card.trend}
                  </Badge>
                </>
              )}
              {card.trendUp === false && (
                <>
                  <IconTrendingDown className="h-3 w-3 text-red-600" />
                  <Badge variant="secondary" className="text-red-600">
                    {card.trend}
                  </Badge>
                </>
              )}
              {card.trendUp === null && (
                <Badge variant="outline">{card.trend}</Badge>
              )}
              <span className="text-muted-foreground">vs mois dernier</span>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
