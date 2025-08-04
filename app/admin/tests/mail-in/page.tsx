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
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  Mail,
  Calendar,
  Users,
  Building,
} from "lucide-react";

type MailIn = {
  id: number;
  date: string;
  subject: string;
  needsMayor: boolean;
  needsDgs: boolean;
  createdAt: string;
  services?: Array<{
    service: {
      id: number;
      name: string;
      code: string;
    };
  }>;
  copies?: Array<{
    council: {
      id: number;
      firstName: string;
      lastName: string;
      position: string;
    };
  }>;
  _count?: {
    copies: number;
    recipients: number;
  };
};

type MailInFormData = {
  date: string;
  subject: string;
  needsMayor: boolean;
  needsDgs: boolean;
  serviceIds: string;
  councilIds: string;
  contactIds: string;
};

type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: any;
};

export default function MailInTestPage() {
  const [mails, setMails] = useState<MailIn[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const form = useForm<MailInFormData>({
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      subject: "",
      needsMayor: false,
      needsDgs: false,
      serviceIds: "",
      councilIds: "",
      contactIds: "",
    },
  });

  // Charger les courriers entrants
  useEffect(() => {
    loadMails();
  }, [refreshKey]);

  const loadMails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/mail-in");
      const data: ApiResponse<{ data: MailIn[] }> = await res.json();
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
  const onSubmit = async (data: MailInFormData) => {
    setError(null);
    try {
      const method = editing ? "PUT" : "POST";
      const endpoint = editing ? `/api/mail-in/${editing}` : "/api/mail-in";

      // Préparer les données
      const payload = {
        date: new Date(data.date),
        subject: data.subject,
        needsMayor: data.needsMayor,
        needsDgs: data.needsDgs,
        serviceIds: data.serviceIds
          ? data.serviceIds
              .split(",")
              .map((id) => parseInt(id.trim()))
              .filter((id) => !isNaN(id))
          : [],
        councilIds: data.councilIds
          ? data.councilIds
              .split(",")
              .map((id) => parseInt(id.trim()))
              .filter((id) => !isNaN(id))
          : [],
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

  const handleEdit = (mail: MailIn) => {
    form.reset({
      date: mail.date.split("T")[0],
      subject: mail.subject,
      needsMayor: mail.needsMayor,
      needsDgs: mail.needsDgs,
      serviceIds: mail.services?.map((s) => s.service.id).join(", ") || "",
      councilIds: mail.copies?.map((c) => c.council.id).join(", ") || "",
      contactIds: "", // À améliorer selon tes besoins
    });
    setEditing(mail.id);
    setError(null);
  };

  const handleDelete = async (id: number) => {
    setError(null);
    try {
      const res = await fetch(`/api/mail-in/${id}`, { method: "DELETE" });
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
        <h1 className="text-3xl font-bold">Test CRUD Courrier Entrant</h1>
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
            {editing ? "Modifier le courrier" : "Créer un courrier entrant"}
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
                <Label htmlFor="subject">Objet</Label>
                <Input
                  id="subject"
                  {...form.register("subject", { required: true })}
                  placeholder="Objet du courrier"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Options</Label>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="needsMayor"
                    checked={form.watch("needsMayor")}
                    onCheckedChange={(checked) =>
                      form.setValue("needsMayor", !!checked)
                    }
                  />
                  <Label htmlFor="needsMayor">Nécessite le maire</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="needsDgs"
                    checked={form.watch("needsDgs")}
                    onCheckedChange={(checked) =>
                      form.setValue("needsDgs", !!checked)
                    }
                  />
                  <Label htmlFor="needsDgs">Nécessite le DGS</Label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serviceIds">
                  Services (IDs séparés par virgule)
                </Label>
                <Input
                  id="serviceIds"
                  {...form.register("serviceIds")}
                  placeholder="1, 2, 3"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="councilIds">
                  Conseillers (IDs séparés par virgule)
                </Label>
                <Input
                  id="councilIds"
                  {...form.register("councilIds")}
                  placeholder="1, 2, 3"
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
            <Mail className="h-5 w-5" />
            Liste des courriers entrants
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
                  <TableHead>Objet</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead>Copies</TableHead>
                  <TableHead>Flags</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mails.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
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
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={mail.subject}>
                          {mail.subject}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {mail.services?.slice(0, 2).map((serviceRel) => (
                            <Badge
                              key={serviceRel.service.id}
                              variant="outline"
                              className="text-xs"
                            >
                              {serviceRel.service.code}
                            </Badge>
                          ))}
                          {mail.services && mail.services.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{mail.services.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {mail._count?.copies || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {mail.needsMayor && (
                            <Badge variant="default" className="text-xs">
                              Maire
                            </Badge>
                          )}
                          {mail.needsDgs && (
                            <Badge variant="secondary" className="text-xs">
                              DGS
                            </Badge>
                          )}
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
                                  <strong>"{mail.subject}"</strong> ? Cette
                                  action est irréversible.
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
