import AfficherParID from "@/components/historique/AfficherParID";
import { PrintMailsDialog } from "@/components/historique/PrintMailsDialog";

export function HistoryHeader() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Historique</h1>
          <p className="text-muted-foreground">
            Consultez l'historique de toutes vos actions
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center gap-6">
        <AfficherParID />
        <PrintMailsDialog />
      </div>
    </div>
  );
}
