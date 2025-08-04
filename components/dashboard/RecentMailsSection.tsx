import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Send, Eye } from "lucide-react";
import { DashboardStats } from "@/components/types/dashboard";

interface RecentMailsSectionProps {
  stats: DashboardStats | null;
  formatDate: (dateString: string) => string;
  onViewMail: (mail: any, type: "in" | "out") => void;
}

export function RecentMailsSection({
  stats,
  formatDate,
  onViewMail,
}: RecentMailsSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Courriers entrants récents */}
      <Card>
        <CardHeader>
          <CardTitle>Courriers entrants récents</CardTitle>
          <CardDescription>Derniers courriers reçus</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.recentMailsIn && stats.recentMailsIn.length > 0 ? (
              stats.recentMailsIn.map((mail: any) => (
                <div
                  key={mail.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{mail.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(mail.date || mail.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {mail.needsMayor && (
                      <Badge variant="destructive" className="text-xs">
                        Maire
                      </Badge>
                    )}
                    {mail.needsDgs && (
                      <Badge variant="secondary" className="text-xs">
                        DGS
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewMail(mail, "in")}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun courrier entrant récent</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
