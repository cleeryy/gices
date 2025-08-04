"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Plus, Edit, Trash2, RefreshCw } from "lucide-react";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  isActive: boolean;
  service?: { id: number; name: string; code: string };
  createdAt: string;
};

type UserFormData = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  serviceId: number;
};

type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: any;
};

export default function UsersTestPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const form = useForm<UserFormData>({
    defaultValues: {
      id: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      serviceId: 1,
    },
  });

  // Charger les utilisateurs
  useEffect(() => {
    loadUsers();
  }, [refreshKey]);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/users");
      const data: ApiResponse<{ data: User[] }> = await res.json();
      if (data.success) {
        // @ts-ignore
        setUsers(data.data?.data || data.data || []);
      } else {
        setError(data.error || "Erreur lors du chargement");
      }
    } catch (err) {
      setError("API inaccessible");
    } finally {
      setLoading(false);
    }
  };

  // Soumettre le formulaire (création ou modification)
  const onSubmit = async (data: UserFormData) => {
    console.log("SUBMITTING");
    setError(null);
    try {
      const method = editing ? "PUT" : "POST";
      const endpoint = editing ? `/api/users/${editing}` : "/api/users";
      const body = editing ? { ...data, password: undefined } : data;

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result: ApiResponse = await res.json();
      if (!result.success) {
        throw new Error(result.error || "Erreur API");
      }

      form.reset();
      setEditing(null);
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      setError(err.message || "Erreur serveur");
    }
  };

  // Préparer l'édition
  const handleEdit = (user: User) => {
    form.reset({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email || "",
      password: "",
      serviceId: user.service?.id || 1,
    });
    setEditing(user.id);
    setError(null);
  };

  // Supprimer un utilisateur
  const handleDelete = async (id: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      const data: ApiResponse = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Erreur suppression");
      }
      setDeleteDialog(null);
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      setError(err.message || "Erreur suppression");
    }
  };

  // Annuler l'édition
  const handleCancel = () => {
    form.reset();
    setEditing(null);
    setError(null);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Test CRUD Utilisateurs</h1>
        <Button
          onClick={() => setRefreshKey((k) => k + 1)}
          variant="outline"
          size="sm"
          disabled={loading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Actualiser
        </Button>
      </div>

      {/* Formulaire de création/édition */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {editing ? "Modifier l'utilisateur" : "Créer un utilisateur"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="id">ID (4 lettres)</Label>
                <Input
                  id="id"
                  {...form.register("id", {
                    required: true,
                    minLength: 4,
                    maxLength: 4,
                    pattern: /^[a-zA-Z]{4}$/,
                  })}
                  disabled={!!editing}
                  placeholder="farb"
                  maxLength={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  {...form.register("firstName", { required: true })}
                  placeholder="Jean"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  {...form.register("lastName", { required: true })}
                  placeholder="Dupont"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  placeholder="jean.dupont@mairie.fr"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serviceId">Service ID</Label>
                <Input
                  id="serviceId"
                  type="number"
                  {...form.register("serviceId", { required: true, min: 1 })}
                  placeholder="1"
                />
              </div>
              {!editing && (
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe (8 caractères)</Label>
                  <Input
                    id="password"
                    type="password"
                    {...form.register("password", {
                      required: !editing,
                      minLength: 8,
                      maxLength: 8,
                    })}
                    placeholder="motdepas"
                    maxLength={8}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                {editing ? "Mettre à jour" : "Créer"}
              </Button>
              {editing && (
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Annuler
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Messages d'erreur */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Liste des utilisateurs */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Chargement...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nom complet</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date création</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground"
                    >
                      Aucun utilisateur trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-mono font-semibold">
                        {user.id}
                      </TableCell>
                      <TableCell>
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell>
                        {user.email || (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.service ? (
                          <Badge variant="outline">
                            {user.service.code} - {user.service.name}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.isActive ? "default" : "secondary"}
                        >
                          {user.isActive ? "Actif" : "Inactif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Dialog
                            open={deleteDialog === user.id}
                            onOpenChange={(open) =>
                              setDeleteDialog(open ? user.id : null)
                            }
                          >
                            <DialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>
                                  Confirmer la suppression
                                </DialogTitle>
                                <DialogDescription>
                                  Êtes-vous sûr de vouloir supprimer
                                  l'utilisateur{" "}
                                  <strong>
                                    {user.firstName} {user.lastName}
                                  </strong>{" "}
                                  ({user.id}) ? Cette action est irréversible.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => setDeleteDialog(null)}
                                >
                                  Annuler
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleDelete(user.id)}
                                >
                                  Supprimer
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
