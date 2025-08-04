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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Edit, Trash2, RefreshCw } from "lucide-react";

type Service = {
  id: number;
  name: string;
  code: string;
  mailType: "IN" | "OUT" | "BOTH";
  isActive: boolean;
  createdAt: string;
  _count?: { users: number };
};

type ServiceFormData = {
  name: string;
  code: string;
  mailType: "IN" | "OUT" | "BOTH";
};

type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: any;
};

export default function ServicesTestPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const form = useForm<ServiceFormData>({
    defaultValues: {
      name: "",
      code: "",
      mailType: "BOTH",
    },
  });

  // Charger les services
  useEffect(() => {
    loadServices();
  }, [refreshKey]);

  const loadServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/services");
      const data: ApiResponse<{ data: Service[] }> = await res.json();
      if (data.success) {
        // @ts-expect-error
        setServices(data.data?.data || data.data || []);
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
  const onSubmit = async (data: ServiceFormData) => {
    setError(null);
    try {
      const method = editing ? "PUT" : "POST";
      const endpoint = editing ? `/api/services/${editing}` : "/api/services";

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

  const handleEdit = (service: Service) => {
    form.reset({
      name: service.name,
      code: service.code,
      mailType: service.mailType,
    });
    setEditing(service.id);
    setError(null);
  };

  const handleDelete = async (id: number) => {
    setError(null);
    try {
      const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
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

  const getMailTypeBadge = (mailType: string) => {
    const variants = {
      IN: { label: "Entrant", variant: "default" as const },
      OUT: { label: "Sortant", variant: "secondary" as const },
      BOTH: { label: "Les deux", variant: "outline" as const },
    };
    return variants[mailType as keyof typeof variants] || variants.BOTH;
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Test CRUD Services</h1>
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
            {editing ? "Modifier le service" : "Créer un service"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du service</Label>
                <Input
                  id="name"
                  {...form.register("name", { required: true })}
                  placeholder="Direction Générale des Services"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Code (2-10 caractères)</Label>
                <Input
                  id="code"
                  {...form.register("code", {
                    required: true,
                    pattern: /^[A-Z0-9]{2,10}$/,
                  })}
                  placeholder="DGS"
                  style={{ textTransform: "uppercase" }}
                  maxLength={10}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mailType">Type de courrier</Label>
                <Select
                  value={form.watch("mailType")}
                  onValueChange={(value: "IN" | "OUT" | "BOTH") =>
                    form.setValue("mailType", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IN">Courrier entrant</SelectItem>
                    <SelectItem value="OUT">Courrier sortant</SelectItem>
                    <SelectItem value="BOTH">Les deux</SelectItem>
                  </SelectContent>
                </Select>
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

      {/* Liste des services */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des services</CardTitle>
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
                  <TableHead>Code</TableHead>
                  <TableHead>Type courrier</TableHead>
                  <TableHead>Utilisateurs</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground"
                    >
                      Aucun service trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  services.map((service) => {
                    const mailTypeBadge = getMailTypeBadge(service.mailType);
                    return (
                      <TableRow key={service.id}>
                        <TableCell className="font-mono">
                          {service.id}
                        </TableCell>
                        <TableCell className="font-medium">
                          {service.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {service.code}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={mailTypeBadge.variant}>
                            {mailTypeBadge.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {service._count?.users || 0} utilisateur(s)
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={service.isActive ? "default" : "secondary"}
                          >
                            {service.isActive ? "Actif" : "Inactif"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(service)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Dialog
                              open={deleteDialog === service.id}
                              onOpenChange={(open) =>
                                setDeleteDialog(open ? service.id : null)
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
                                    service <strong>{service.name}</strong> (
                                    {service.code}) ? Cette action est
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
                                    onClick={() => handleDelete(service.id)}
                                  >
                                    Supprimer
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
