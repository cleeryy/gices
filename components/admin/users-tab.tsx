"use client";

import { useState, useEffect } from "react";
import { DataTable } from "./data-table";
import { UserDrawer } from "./user-drawer";
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

  // Pour le dialog de suppression
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

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

  // Ouvre le dialog de confirmation
  const confirmDelete = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  // Suppression réelle, appelée seulement à la confirmation
  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      const response = await fetch(`/api/users/${userToDelete.id}`, {
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
    setDeleteDialogOpen(false);
    setUserToDelete(null);
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
        onDelete={confirmDelete}
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
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer cet utilisateur ?</DialogTitle>
            <DialogDescription>
              Cette action est{" "}
              <span className="font-bold text-destructive">irréversible</span>.
              <br />
              Es-tu sûr de vouloir supprimer{" "}
              <strong>
                {userToDelete?.firstName} {userToDelete?.lastName}
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
