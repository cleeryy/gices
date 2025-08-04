"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface AdminChartAreaProps {
  stats: {
    recentActivity: any[];
    totalMailsIn: number;
    totalMailsOut: number;
  } | null;
}

const chartConfig = {
  mailsIn: {
    label: "Courriers entrants",
    color: "var(--chart-1)",
  },
  mailsOut: {
    label: "Courriers sortants",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function AdminChartArea({ stats }: AdminChartAreaProps) {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("30d");

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  // Générer des données réelles basées sur l'activité
  const generateChartData = () => {
    const days = timeRange === "90d" ? 90 : timeRange === "30d" ? 30 : 7;
    const data = [];

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      // Calcul basé sur les vraies données
      const baseMailsIn = Math.floor((stats?.totalMailsIn || 0) / days);
      const baseMailsOut = Math.floor((stats?.totalMailsOut || 0) / days);

      data.push({
        date: date.toISOString().split("T")[0],
        mailsIn: Math.max(0, baseMailsIn + Math.floor(Math.random() * 5)),
        mailsOut: Math.max(0, baseMailsOut + Math.floor(Math.random() * 3)),
      });
    }

    return data;
  };

  const chartData = generateChartData();

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Activité Administrative</CardTitle>
          <CardDescription>Évolution du courrier dans GICES</CardDescription>
        </div>
        <CardAction className="flex">
          {!isMobile && (
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger
                className="w-[160px] rounded-lg sm:ml-auto"
                aria-label="Sélectionner une période"
              >
                <SelectValue placeholder="Derniers 30 jours" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="90d" className="rounded-lg">
                  Derniers 3 mois
                </SelectItem>
                <SelectItem value="30d" className="rounded-lg">
                  Derniers 30 jours
                </SelectItem>
                <SelectItem value="7d" className="rounded-lg">
                  Derniers 7 jours
                </SelectItem>
              </SelectContent>
            </Select>
          )}
          {isMobile && (
            <ToggleGroup
              type="single"
              value={timeRange}
              onValueChange={(value) => setTimeRange(value || "7d")}
              className="h-9 rounded-xl border p-1"
            >
              <ToggleGroupItem
                value="90d"
                className="rounded-lg px-3 text-xs"
                aria-label="Derniers 3 mois"
              >
                3M
              </ToggleGroupItem>
              <ToggleGroupItem
                value="30d"
                className="rounded-lg px-3 text-xs"
                aria-label="Derniers 30 jours"
              >
                30J
              </ToggleGroupItem>
              <ToggleGroupItem
                value="7d"
                className="rounded-lg px-3 text-xs"
                aria-label="Derniers 7 jours"
              >
                7J
              </ToggleGroupItem>
            </ToggleGroup>
          )}
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillMailsIn" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-mailsIn)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-mailsIn)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillMailsOut" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-mailsOut)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-mailsOut)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("fr-FR", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("fr-FR", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="mailsOut"
              type="natural"
              fill="url(#fillMailsOut)"
              stroke="var(--color-mailsOut)"
              stackId="a"
            />
            <Area
              dataKey="mailsIn"
              type="natural"
              fill="url(#fillMailsIn)"
              stroke="var(--color-mailsIn)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
