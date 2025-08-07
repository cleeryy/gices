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

  // Pour le dialog de suppression
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [councilToDelete, setCouncilToDelete] = useState<CouncilMember | null>(
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

  const confirmDelete = (c: CouncilMember) => {
    setCouncilToDelete(c);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!councilToDelete) return;
    try {
      const response = await fetch(`/api/council/${councilToDelete.id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (result.success) {
        toast.success("Membre supprimé");
        fetchCouncil();
      } else toast.error(result.message || "Erreur lors de la suppression");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
    setDeleteDialogOpen(false);
    setCouncilToDelete(null);
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
      label: "Actif",
      render: (value: boolean) => (
        <Badge variant={value ? "default" : "destructive"}>
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
        title="Membres du conseil"
        description="Gérez les membres du conseil municipal"
        onEdit={handleEdit}
        onDelete={confirmDelete}
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
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer ce membre ?</DialogTitle>
            <DialogDescription>
              Cette action est{" "}
              <span className="font-bold text-destructive">irréversible</span>.
              <br />
              Es-tu sûr de vouloir supprimer{" "}
              <strong>
                {councilToDelete?.firstName} {councilToDelete?.lastName}
              </strong>
               ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete} autoFocus>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
