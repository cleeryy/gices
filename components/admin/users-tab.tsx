"use client";

import { useState, useEffect } from "react";
import { DataTable } from "./data-table";
import { UserDrawer } from "./user-drawer";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  role: "USER" | "ADMIN";
  isActive: boolean;
  serviceId: number;
  service: {
    name: string;
    code: string;
  };
}

export function UsersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/users?limit=1000");
      const result = await response.json();

      // La réponse attendue : { success: true, data: { data: User[], pagination: {...} }, ... }
      if (result.success && result.data) {
        const usersData = result.data.data; // Ton tableau d’utilisateurs réels est ici
        if (Array.isArray(usersData)) {
          setUsers(usersData);
        } else {
          setUsers([]);
          toast.error("Réponse de l’API inattendue : pas de tableau users");
        }
      } else {
        setUsers([]);
        toast.error("Erreur API : Users non récupérés");
      }
    } catch (error) {
      setUsers([]);
      toast.error("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsDrawerOpen(true);
  };

  const handleAdd = () => {
    setSelectedUser(null);
    setIsDrawerOpen(true);
  };

  const handleDelete = async (user: User) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      try {
        const response = await fetch(`/api/users/${user.id}`, {
          method: "DELETE",
        });
        const result = await response.json();
        if (result.success) {
          toast.success("Utilisateur supprimé");
          fetchUsers();
        } else {
          toast.error(result.message || "Erreur lors de la suppression");
        }
      } catch (error) {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  // Définition des colonnes du tableau
  const columns = [
    { key: "id" as keyof User, label: "ID" },
    { key: "firstName" as keyof User, label: "Prénom" },
    { key: "lastName" as keyof User, label: "Nom" },
    { key: "email" as keyof User, label: "Email" },
    {
      key: "role" as keyof User,
      label: "Rôle",
      render: (value: string) => (
        <Badge variant={value === "ADMIN" ? "default" : "secondary"}>
          {value}
        </Badge>
      ),
    },
    {
      key: "service" as keyof User,
      label: "Service",
      render: (value: User["service"]) =>
        value ? `${value.name} (${value.code})` : "—",
    },
    {
      key: "isActive" as keyof User,
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
        data={users}
        columns={columns}
        title="Utilisateurs"
        description="Gérez les utilisateurs de l'application"
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        searchKey="firstName"
        loading={loading}
      />
      <UserDrawer
        user={selectedUser}
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onSuccess={() => {
          fetchUsers();
          setIsDrawerOpen(false);
        }}
      />
    </>
  );
}
