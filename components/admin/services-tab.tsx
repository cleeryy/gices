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

  // Pour le dialog de désactivation/réactivation
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [serviceToAction, setServiceToAction] = useState<Service | null>(null);

  const fetchServices = async () => {
    setLoading(true);
    try {
      // Inclure les services inactifs pour l'admin
      const response = await fetch(
        "/api/services?limit=1000&includeInactive=true"
      );
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

  // Ouvre le dialog de confirmation pour désactiver/réactiver
  const confirmAction = (svc: Service) => {
    setServiceToAction(svc);
    setActionDialogOpen(true);
  };

  // Désactivation ou réactivation selon l'état actuel
  const handleAction = async () => {
    if (!serviceToAction) return;

    try {
      let response;
      let successMessage;

      if (serviceToAction.isActive) {
        // Désactiver avec DELETE
        response = await fetch(`/api/services/${serviceToAction.id}`, {
          method: "DELETE",
        });
        successMessage = "Service désactivé";
      } else {
        // Réactiver avec PUT
        response = await fetch(`/api/services/${serviceToAction.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: true }),
        });
        successMessage = "Service réactivé";
      }

      const result = await response.json();
      if (result.success) {
        toast.success(successMessage);
        fetchServices();
      } else {
        toast.error(result.message || "Erreur lors de l'action");
      }
    } catch {
      toast.error("Erreur lors de l'action");
    }

    setActionDialogOpen(false);
    setServiceToAction(null);
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
        data={services}
        columns={columns}
        title="Services"
        description="Gérez les services (actifs et inactifs)"
        onEdit={handleEdit}
        onDelete={confirmAction}
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
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {serviceToAction?.isActive ? "Désactiver" : "Réactiver"} ce
              service ?
            </DialogTitle>
            <DialogDescription>
              {serviceToAction?.isActive ? (
                <>
                  Le service <strong>{serviceToAction?.name}</strong> sera
                  désactivé et n'apparaîtra plus dans les listes pour les
                  utilisateurs.
                  <br />
                  <span className="text-sm text-muted-foreground">
                    Vous pourrez le réactiver à tout moment.
                  </span>
                </>
              ) : (
                <>
                  Le service <strong>{serviceToAction?.name}</strong> sera
                  réactivé et redeviendra disponible pour les utilisateurs.
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
              variant={serviceToAction?.isActive ? "destructive" : "default"}
              onClick={handleAction}
              autoFocus
            >
              {serviceToAction?.isActive ? "Désactiver" : "Réactiver"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
