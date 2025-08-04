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
import { Loader2, Plus, Edit, Trash2, RefreshCw, Send } from "lucide-react";

type ContactOut = {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { mailsReceived: number };
};

type ContactFormData = {
  name: string;
};

type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: any;
};

export default function ContactsOutTestPage() {
  const [contacts, setContacts] = useState<ContactOut[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const form = useForm<ContactFormData>({
    defaultValues: {
      name: "",
    },
  });

  // Charger les contacts sortants
  useEffect(() => {
    loadContacts();
  }, [refreshKey]);

  const loadContacts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/contacts-out");
      const data: ApiResponse<{ data: ContactOut[] }> = await res.json();
      if (data.success) {
        // @ts-expect-error
        setContacts(data.data?.data || data.data || []);
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
  const onSubmit = async (data: ContactFormData) => {
    setError(null);
    try {
      const method = editing ? "PUT" : "POST";
      const endpoint = editing
        ? `/api/contacts-out/${editing}`
        : "/api/contacts-out";

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

  const handleEdit = (contact: ContactOut) => {
    form.reset({
      name: contact.name,
    });
    setEditing(contact.id);
    setError(null);
  };

  const handleDelete = async (id: number) => {
    setError(null);
    try {
      const res = await fetch(`/api/contacts-out/${id}`, { method: "DELETE" });
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
        <h1 className="text-3xl font-bold">Test CRUD Contacts Sortants</h1>
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
            {editing ? "Modifier le contact" : "Créer un contact"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du contact</Label>
              <Input
                id="name"
                {...form.register("name", { required: true })}
                placeholder="Mairie de Toulouse"
              />
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

      {/* Liste des contacts */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des contacts sortants</CardTitle>
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
                  <TableHead>Nom</TableHead>
                  <TableHead>Courriers envoyés</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground"
                    >
                      Aucun contact trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  contacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell className="font-mono">{contact.id}</TableCell>
                      <TableCell className="font-medium">
                        {contact.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Send className="h-4 w-4 text-muted-foreground" />
                          {contact._count?.mailsReceived || 0} courrier(s)
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={contact.isActive ? "default" : "secondary"}
                        >
                          {contact.isActive ? "Actif" : "Inactif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(contact.createdAt).toLocaleDateString(
                          "fr-FR"
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(contact)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <Dialog
                            open={deleteDialog === contact.id}
                            onOpenChange={(open) =>
                              setDeleteDialog(open ? contact.id : null)
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
                                  Êtes-vous sûr de vouloir supprimer le contact{" "}
                                  <strong>{contact.name}</strong> ? Cette action
                                  est irréversible.
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
                                  onClick={() => handleDelete(contact.id)}
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
