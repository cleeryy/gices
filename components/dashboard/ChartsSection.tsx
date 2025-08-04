import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { FileText, TrendingUp } from "lucide-react";
import { DashboardStats } from "@/components/types/dashboard";

interface ChartsSectionProps {
  stats: DashboardStats | null;
}

export function ChartsSection({ stats }: ChartsSectionProps) {
  // 🔥 CALCUL DES DONNÉES ETALÉES SUR LES JOURS DU MOIS COURANT
  const calculateCurrentMonthByDay = () => {
    if (!stats) return [];

    const now = new Date(); // Mois réel (août si on ne force pas)

    const year = now.getFullYear();
    const month = now.getMonth(); // 0-based
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Liste des courriers entrants
    const allMailsIn = stats.allMailsIn || stats.recentMailsIn || [];

    // Tableau final contenant les data pour chaque jour du mois
    const daysData = [];

    for (let day = 1; day <= daysInMonth; day++) {
      // Début et fin du jour courant
      const startDate = new Date(year, month, day, 0, 0, 0, 0);
      const endDate = new Date(year, month, day, 23, 59, 59, 999);

      // Calculer le nombre de courriers entrants pour ce jour
      const entrants = allMailsIn.filter((mail: any) => {
        const mailDate = new Date(mail.date || mail.createdAt);
        return mailDate >= startDate && mailDate <= endDate;
      }).length;

      // Optionnel: afficher le n° du jour OU au format "01 août", "02 août" etc.
      const displayDay = `${day.toString().padStart(2, "0")}/${(month + 1)
        .toString()
        .padStart(2, "0")}`;

      daysData.push({
        day: displayDay, // ex: "03/08"
        entrants,
        fullDate: startDate.toISOString(),
      });
    }

    return daysData;
  };

  const dailyData = calculateCurrentMonthByDay();

  // 🔥 CONFIGURATION DES COULEURS (une seule série)
  const barChartConfig = {
    entrants: {
      label: "Courriers entrants",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  // 🔥 CONFIGURATION DES COULEURS POUR LE PIE CHART (inchangée)
  const pieChartConfig = {
    value: {
      label: "Courriers",
    },
    service1: { color: "var(--chart-1)" },
    service2: { color: "var(--chart-2)" },
    service3: { color: "var(--chart-3)" },
    service4: { color: "var(--chart-4)" },
    service5: { color: "var(--chart-5)" },
    service6: { color: "var(--chart-6)" },
    service7: { color: "var(--chart-7)" },
    service8: { color: "var(--chart-8)" },
  } satisfies ChartConfig;

  // Préparer les données du pie chart avec les couleurs
  const serviceStatsWithColors =
    stats?.serviceStats?.map((stat: any, index: number) => ({
      ...stat,
      fill: `var(--chart-${index + 1})`,
    })) || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* 🔥 BarChart avec la distribution par jour du mois courant */}
      <Card>
        <CardHeader>
          <CardTitle>
            Courriers par jour (
            {dailyData.length > 0 ? dailyData[0].day.slice(3) : ""}{" "}
            {new Date().getFullYear()})
          </CardTitle>
          <CardDescription>
            Données réelles sur chaque jour du mois courant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={barChartConfig}>
            <BarChart
              accessibilityLayer
              data={dailyData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                angle={-45}
                textAnchor="end"
                height={80}
                // Affiche les jours du mois (01/08, 02/08, etc.)
                tickFormatter={(value) => value}
              />
              <YAxis />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dashed" />}
              />
              <Bar
                dataKey="entrants"
                fill="var(--chart-1)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 leading-none font-medium">
            Nombre de courriers entrants <TrendingUp className="h-4 w-4" />
          </div>
          <div className="text-muted-foreground leading-none">
            Distribution sur les jours du mois
          </div>
        </CardFooter>
      </Card>

      {/* 🔥 PieChart conservé tel quel */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition par service</CardTitle>
          <CardDescription>
            Distribution du courrier entrant par service
          </CardDescription>
        </CardHeader>
        <CardContent>
          {serviceStatsWithColors && serviceStatsWithColors.length > 0 ? (
            <ChartContainer config={pieChartConfig}>
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={serviceStatsWithColors}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {serviceStatsWithColors.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucune donnée de service disponible</p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="text-muted-foreground leading-none">
            Répartition basée sur les courriers entrants reçus
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
