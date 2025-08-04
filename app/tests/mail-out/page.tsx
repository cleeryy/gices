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
  Send,
  Calendar,
  Building,
  User,
} from "lucide-react";

type MailOut = {
  id: number;
  date: string;
  subject: string;
  reference: string;
  createdAt: string;
  service?: {
    id: number;
    name: string;
    code: string;
  };
  user?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  _count?: {
    recipients: number;
  };
};

type MailOutFormData = {
  date: string;
  subject: string;
  reference: string;
  serviceId: number;
  userId: string;
  contactIds: string;
};

type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: any;
};

export default function MailOutTestPage() {
  const [mails, setMails] = useState<MailOut[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const form = useForm<MailOutFormData>({
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      subject: "",
      reference: "",
      serviceId: 1,
      userId: "",
      contactIds: "",
    },
  });

  // Charger les courriers sortants
  useEffect(() => {
    loadMails();
  }, [refreshKey]);

  const loadMails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/mail-out");
      const data: ApiResponse<{ data: MailOut[] }> = await res.json();
      if (data.success) {
        // @ts-expect-error
        setMails(data.data?.data || data.data || []);
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
  const onSubmit = async (data: MailOutFormData) => {
    setError(null);
    try {
      const method = editing ? "PUT" : "POST";
      const endpoint = editing ? `/api/mail-out/${editing}` : "/api/mail-out";

      // Préparer les données
      const payload = {
        date: new Date(data.date),
        subject: data.subject,
        reference: data.reference,
        serviceId: Number(data.serviceId),
        userId: data.userId,
        contactIds: data.contactIds
          ? data.contactIds
              .split(",")
              .map((id) => parseInt(id.trim()))
              .filter((id) => !isNaN(id))
          : [],
      };

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

  const handleEdit = (mail: MailOut) => {
    form.reset({
      date: mail.date.split("T")[0],
      subject: mail.subject,
      reference: mail.reference,
      serviceId: mail.service?.id || 1,
      userId: mail.user?.id || "",
      contactIds: "", // À améliorer selon tes besoins
    });
    setEditing(mail.id);
    setError(null);
  };

  const handleDelete = async (id: number) => {
    setError(null);
    try {
      const res = await fetch(`/api/mail-out/${id}`, { method: "DELETE" });
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
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Test CRUD Courrier Sortant</h1>
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
            {editing ? "Modifier le courrier" : "Créer un courrier sortant"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  {...form.register("date", { required: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference">Référence</Label>
                <Input
                  id="reference"
                  {...form.register("reference", { required: true })}
                  placeholder="REF-2024-001"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Objet</Label>
              <Input
                id="subject"
                {...form.register("subject", { required: true })}
                placeholder="Objet du courrier"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serviceId">Service ID</Label>
                <Input
                  id="serviceId"
                  type="number"
                  {...form.register("serviceId", { required: true, min: 1 })}
                  placeholder="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userId">User ID (4 lettres)</Label>
                <Input
                  id="userId"
                  {...form.register("userId", { required: true })}
                  placeholder="farb"
                  maxLength={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactIds">
                  Contacts (IDs séparés par virgule)
                </Label>
                <Input
                  id="contactIds"
                  {...form.register("contactIds")}
                  placeholder="1, 2, 3"
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

      {/* Liste des courriers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Liste des courriers sortants
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
                  <TableHead>Date</TableHead>
                  <TableHead>Référence</TableHead>
                  <TableHead>Objet</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Destinataires</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mails.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-muted-foreground"
                    >
                      Aucun courrier trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  mails.map((mail) => (
                    <TableRow key={mail.id}>
                      <TableCell className="font-mono">{mail.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(mail.date).toLocaleDateString("fr-FR")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {mail.reference}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={mail.subject}>
                          {mail.subject}
                        </div>
                      </TableCell>
                      <TableCell>
                        {mail.service && (
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <Badge variant="outline">{mail.service.code}</Badge>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {mail.user && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {mail.user.firstName} {mail.user.lastName}
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Send className="h-4 w-4 text-muted-foreground" />
                          {mail._count?.recipients || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(mail)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <Dialog
                            open={deleteDialog === mail.id}
                            onOpenChange={(open) =>
                              setDeleteDialog(open ? mail.id : null)
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
                                  Êtes-vous sûr de vouloir supprimer le courrier{" "}
                                  <strong>"{mail.subject}"</strong> (
                                  {mail.reference}) ? Cette action est
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
                                  onClick={() => handleDelete(mail.id)}
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
