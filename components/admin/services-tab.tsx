"use client";

import { useState, useEffect } from "react";
import { DataTable } from "./data-table";
import { ServiceDrawer } from "./service-drawer";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

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
  const handleDelete = async (svc: Service) => {
    if (confirm("Supprimer ce service ?")) {
      try {
        const response = await fetch(`/api/services/${svc.id}`, {
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
    }
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
        onDelete={handleDelete}
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
    </>
  );
}
