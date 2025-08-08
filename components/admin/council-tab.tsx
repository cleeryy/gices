"use client";

import { useState, useEffect } from "react";
import { DataTable } from "./data-table";
import { CouncilDrawer } from "./council-drawer";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CouncilMember {
  id: number;
  firstName: string;
  lastName: string;
  position: string;
  login: string;
  isActive: boolean;
  _count: { mailCopies: number };
}

export function CouncilTab() {
  const [council, setCouncil] = useState<CouncilMember[]>([]);
  const [selectedCouncil, setSelectedCouncil] = useState<CouncilMember | null>(
    null
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Pour le dialog de désactivation/réactivation
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [councilToAction, setCouncilToAction] = useState<CouncilMember | null>(
    null
  );

  const fetchCouncil = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "/api/council?limit=1000&includeInactive=true"
      );
      const result = await response.json();
      if (result.success && result.data) {
        const arr = result.data.data;
        setCouncil(Array.isArray(arr) ? arr : []);
      } else setCouncil([]);
    } catch {
      setCouncil([]);
      toast.error("Erreur lors du chargement");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCouncil();
  }, []);

  const handleEdit = (c: CouncilMember) => {
    setSelectedCouncil(c);
    setIsDrawerOpen(true);
  };

  const handleAdd = () => {
    setSelectedCouncil(null);
    setIsDrawerOpen(true);
  };

  // Ouvre le dialog de confirmation pour désactiver/réactiver
  const confirmAction = (c: CouncilMember) => {
    setCouncilToAction(c);
    setActionDialogOpen(true);
  };

  // Désactivation ou réactivation selon l'état actuel
  const handleAction = async () => {
    if (!councilToAction) return;

    try {
      let response;
      let successMessage;

      if (councilToAction.isActive) {
        // Désactiver avec DELETE
        response = await fetch(`/api/council/${councilToAction.id}`, {
          method: "DELETE",
        });
        successMessage = "Membre désactivé";
      } else {
        // Réactiver avec PUT
        response = await fetch(`/api/council/${councilToAction.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: true }),
        });
        successMessage = "Membre réactivé";
      }

      const result = await response.json();
      if (result.success) {
        toast.success(successMessage);
        fetchCouncil();
      } else {
        toast.error(result.message || "Erreur lors de l'action");
      }
    } catch {
      toast.error("Erreur lors de l'action");
    }

    setActionDialogOpen(false);
    setCouncilToAction(null);
  };

  const columns = [
    { key: "id" as keyof CouncilMember, label: "ID" },
    { key: "firstName" as keyof CouncilMember, label: "Prénom" },
    { key: "lastName" as keyof CouncilMember, label: "Nom" },
    { key: "position" as keyof CouncilMember, label: "Poste" },
    {
      key: "_count" as keyof CouncilMember,
      label: "Copies",
      render: (count: CouncilMember["_count"]) => count?.mailCopies,
    },
    {
      key: "isActive" as keyof CouncilMember,
      label: "Statut",
      render: (value: boolean) => (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? "Actif" : "Inactif"}
        </Badge>
      ),
    },
  ];

  return (
    <>
      <DataTable
        data={council}
        columns={columns}
        title="Élus"
        description="Gérez les élus (actifs et inactifs)"
        onEdit={handleEdit}
        onDelete={confirmAction}
        onAdd={handleAdd}
        searchKey="lastName"
        loading={loading}
      />
      <CouncilDrawer
        councilMember={selectedCouncil}
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onSuccess={() => {
          fetchCouncil();
          setIsDrawerOpen(false);
        }}
      />
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {councilToAction?.isActive ? "Désactiver" : "Réactiver"} ce membre
              ?
            </DialogTitle>
            <DialogDescription>
              {councilToAction?.isActive ? (
                <>
                  Le membre{" "}
                  <strong>
                    {councilToAction?.firstName} {councilToAction?.lastName}
                  </strong>{" "}
                  sera désactivé et n'apparaîtra plus dans les listes pour les
                  utilisateurs.
                  <br />
                  <span className="text-sm text-muted-foreground">
                    Vous pourrez le réactiver à tout moment.
                  </span>
                </>
              ) : (
                <>
                  Le membre{" "}
                  <strong>
                    {councilToAction?.firstName} {councilToAction?.lastName}
                  </strong>{" "}
                  sera réactivé et redeviendra disponible pour les utilisateurs.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              variant={councilToAction?.isActive ? "destructive" : "default"}
              onClick={handleAction}
              autoFocus
            >
              {councilToAction?.isActive ? "Désactiver" : "Réactiver"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
