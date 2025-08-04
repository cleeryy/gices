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
import {
  Loader2,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Users,
  Mail,
} from "lucide-react";

type CouncilMember = {
  id: number;
  firstName: string;
  lastName: string;
  position: string;
  login: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { mailCopies: number };
};

type CouncilFormData = {
  firstName: string;
  lastName: string;
  position: string;
  login: string;
};

type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: any;
};

export default function CouncilTestPage() {
  const [councilMembers, setCouncilMembers] = useState<CouncilMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const form = useForm<CouncilFormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      position: "",
      login: "",
    },
  });

  // Charger les conseillers
  useEffect(() => {
    loadCouncilMembers();
  }, [refreshKey]);

  const loadCouncilMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/council");
      const data: ApiResponse<{ data: CouncilMember[] }> = await res.json();
      if (data.success) {
        // @ts-expect-error
        setCouncilMembers(data.data?.data || data.data || []);
      } else {
        setError(data.error || "Erreur lors du chargement");
      }
    } catch (err) {
      setError("API inaccessible");
    } finally {
      setLoading(false);
    }
  };

  // Soumettre le formulaire
  const onSubmit = async (data: CouncilFormData) => {
    setError(null);
    try {
      const method = editing ? "PUT" : "POST";
      const endpoint = editing ? `/api/council/${editing}` : "/api/council";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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

  const handleEdit = (member: CouncilMember) => {
    form.reset({
      firstName: member.firstName,
      lastName: member.lastName,
      position: member.position,
      login: member.login,
    });
    setEditing(member.id);
    setError(null);
  };

  const handleDelete = async (id: number) => {
    setError(null);
    try {
      const res = await fetch(`/api/council/${id}`, { method: "DELETE" });
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

  const handleCancel = () => {
    form.reset();
    setEditing(null);
    setError(null);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Test CRUD Conseillers Municipaux</h1>
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

      {/* Formulaire */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {editing ? "Modifier le conseiller" : "Créer un conseiller"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  {...form.register("position", { required: true })}
                  placeholder="1er adjoint au maire"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login">Login</Label>
                <Input
                  id="login"
                  {...form.register("login", { required: true })}
                  placeholder="jdupont"
                />
              </div>
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

      {/* Liste des conseillers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Liste des conseillers municipaux
          </CardTitle>
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
                  <TableHead>Position</TableHead>
                  <TableHead>Login</TableHead>
                  <TableHead>Copies courrier</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {councilMembers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground"
                    >
                      Aucun conseiller trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  councilMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-mono">{member.id}</TableCell>
                      <TableCell className="font-medium">
                        {member.firstName} {member.lastName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{member.position}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {member.login}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {member._count?.mailCopies || 0} copie(s)
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={member.isActive ? "default" : "secondary"}
                        >
                          {member.isActive ? "Actif" : "Inactif"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(member)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <Dialog
                            open={deleteDialog === member.id}
                            onOpenChange={(open) =>
                              setDeleteDialog(open ? member.id : null)
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
                                  Êtes-vous sûr de vouloir supprimer le
                                  conseiller{" "}
                                  <strong>
                                    {member.firstName} {member.lastName}
                                  </strong>{" "}
                                  ({member.position}) ? Cette action est
                                  irréversible.
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
                                  onClick={() => handleDelete(member.id)}
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
