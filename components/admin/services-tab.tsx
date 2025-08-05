"use client";

import { useState, useEffect } from "react";
import { DataTable } from "./data-table";
import { ServiceDrawer } from "./service-drawer";
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

interface Service {
  id: number;
  name: string;
  code: string;
  mailType: string;
  isActive: boolean;
  _count: { users: number };
}

export function ServicesTab() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Pour le dialog de suppression
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/services?limit=1000");
      const result = await response.json();
      if (result.success && result.data) {
        const arr = result.data.data;
        setServices(Array.isArray(arr) ? arr : []);
      } else setServices([]);
    } catch {
      setServices([]);
      toast.error("Erreur lors du chargement");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleEdit = (svc: Service) => {
    setSelectedService(svc);
    setIsDrawerOpen(true);
  };
  const handleAdd = () => {
    setSelectedService(null);
    setIsDrawerOpen(true);
  };

  // Ouvre le dialog de confirmation au lieu de delete direct
  const confirmDelete = (svc: Service) => {
    setServiceToDelete(svc);
    setDeleteDialogOpen(true);
  };

  // Suppression réelle, appelée seulement sur "Supprimer" dans le Dialog
  const handleDelete = async () => {
    if (!serviceToDelete) return;
    try {
      const response = await fetch(`/api/services/${serviceToDelete.id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (result.success) {
        toast.success("Service supprimé");
        fetchServices();
      } else toast.error(result.message || "Erreur lors de la suppression");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
    setDeleteDialogOpen(false);
    setServiceToDelete(null);
  };

  const columns = [
    { key: "id" as keyof Service, label: "ID" },
    { key: "name" as keyof Service, label: "Nom" },
    { key: "code" as keyof Service, label: "Code" },
    { key: "mailType" as keyof Service, label: "Type" },
    {
      key: "_count" as keyof Service,
      label: "Utilisateurs",
      render: (count: Service["_count"]) => count?.users,
    },
    {
      key: "isActive" as keyof Service,
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
        data={services}
        columns={columns}
        title="Services"
        description="Gérez les services"
        onEdit={handleEdit}
        onDelete={confirmDelete}
        onAdd={handleAdd}
        searchKey="name"
        loading={loading}
      />
      <ServiceDrawer
        service={selectedService}
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onSuccess={() => {
          fetchServices();
          setIsDrawerOpen(false);
        }}
      />
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer ce service ?</DialogTitle>
            <DialogDescription>
              Cette action est{" "}
              <span className="font-bold text-destructive">irréversible</span>.
              <br />
              Es-tu sûr de vouloir supprimer{" "}
              <strong>{serviceToDelete?.name}</strong> ?
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
