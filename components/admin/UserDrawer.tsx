"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  IconUser,
  IconMail,
  IconBuilding,
  IconCalendar,
  IconEdit,
  IconTrash,
  IconLock,
  IconCar,
  IconX,
  IconAlertCircle,
  IconCheck,
  IconLoader2,
} from "@tabler/icons-react";
import { toast } from "sonner";

// Schema de validation
const userSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  serviceId: z.string().optional(),
  isActive: z.boolean(),
  notes: z.string().optional(),
});

type UserFormValues = z.infer<typeof userSchema>;

interface UserDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any | null;
  mode: "view" | "edit" | "create";
  services: any[];
  onUserUpdated: () => void;
}

export function UserDrawer({
  open,
  onOpenChange,
  user,
  mode,
  services,
  onUserUpdated,
}: UserDrawerProps) {
  const [editMode, setEditMode] = React.useState(
    mode === "edit" || mode === "create"
  );
  const [loading, setLoading] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      serviceId: "",
      isActive: true,
      notes: "",
    },
  });

  // Remplir le formulaire quand l'utilisateur change
  React.useEffect(() => {
    if (user && open) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        // 🔥 GÉRER LA CONVERSION POUR L'AFFICHAGE
        serviceId: user.serviceId ? user.serviceId.toString() : "",
        isActive: user.isActive !== false,
        notes: user.notes || "",
      });
    } else if (mode === "create" && open) {
      form.reset({
        firstName: "",
        lastName: "",
        email: "",
        serviceId: "",
        isActive: true,
        notes: "",
      });
    }
  }, [user, open, mode, form]);

  // Réinitialiser quand le drawer se ferme
  React.useEffect(() => {
    if (!open) {
      setEditMode(mode === "edit" || mode === "create");
      form.reset();
    }
  }, [open, mode, form]);

  const onSubmit = async (data: UserFormValues) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        // 🔥 CONVERSION FINALE : CHAÎNE VIDE = NULL POUR L'API
        serviceId:
          data.serviceId && data.serviceId !== ""
            ? parseInt(data.serviceId)
            : null,
      };

      let response;
      if (mode === "create") {
        response = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`/api/users/${user.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Erreur lors de la sauvegarde");
      }

      toast.success(
        mode === "create"
          ? "Utilisateur créé avec succès"
          : "Utilisateur mis à jour avec succès"
      );
      onUserUpdated();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Erreur lors de la suppression");
      }

      toast.success("Utilisateur supprimé avec succès");
      onUserUpdated();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la suppression");
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  const toggleUserStatus = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...user,
          isActive: !user.isActive,
        }),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(
          result.error || "Erreur lors de la mise à jour du statut"
        );
      }

      toast.success(
        `Utilisateur ${user.isActive ? "désactivé" : "activé"} avec succès`
      );
      onUserUpdated();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la mise à jour du statut");
    } finally {
      setLoading(false);
    }
  };

  const getDrawerTitle = () => {
    if (mode === "create") return "Créer un utilisateur";
    if (editMode) return "Modifier l'utilisateur";
    return "Détails de l'utilisateur";
  };

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[96vh]">
          <DrawerHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <DrawerTitle className="flex items-center space-x-2">
                  <IconUser className="h-5 w-5" />
                  <span>{getDrawerTitle()}</span>
                </DrawerTitle>
                <DrawerDescription>
                  {mode === "create"
                    ? "Créez un nouvel utilisateur dans le système GICES"
                    : editMode
                    ? "Modifiez les informations de l'utilisateur"
                    : "Consultez et gérez les informations de l'utilisateur"}
                </DrawerDescription>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="sm">
                  <IconX className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto p-6">
            {!editMode && user && (
              <div className="space-y-6 mb-6">
                {/* Profil utilisateur */}
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-lg">
                      {user.firstName?.[0]}
                      {user.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">
                      {user.firstName} {user.lastName}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? "Actif" : "Inactif"}
                      </Badge>
                      {user.service && (
                        <Badge variant="outline">{user.service.name}</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Informations détaillées */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <IconMail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <IconBuilding className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Service</p>
                        <p className="font-medium">
                          {user.service
                            ? `${user.service.name} (${user.service.code})`
                            : "Non assigné"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <IconCalendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Créé le</p>
                        <p className="font-medium">
                          {new Date(user.createdAt).toLocaleDateString(
                            "fr-FR",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <IconUser className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          ID Utilisateur
                        </p>
                        <p className="font-medium font-mono">#{user.id}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {user.notes && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Notes
                      </p>
                      <p className="text-sm bg-muted p-3 rounded-md">
                        {user.notes}
                      </p>
                    </div>
                  </>
                )}

                <Separator />

                {/* Actions rapides */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditMode(true)}
                  >
                    <IconEdit className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleUserStatus}
                    disabled={loading}
                  >
                    {user.isActive ? (
                      <>
                        <IconLock className="h-4 w-4 mr-2" />
                        Désactiver
                      </>
                    ) : (
                      <>
                        <IconLock className="h-4 w-4 mr-2" />
                        Activer
                      </>
                    )}
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <IconTrash className="h-4 w-4 mr-2" />
                    Supprimer
                  </Button>
                </div>
              </div>
            )}

            {/* Formulaire d'édition/création */}
            {editMode && (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prénom</FormLabel>
                          <FormControl>
                            <Input placeholder="Jean" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom</FormLabel>
                          <FormControl>
                            <Input placeholder="Dupont" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="jean.dupont@mairie.fr"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="serviceId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            // 🔥 CONVERTIR "none" EN CHAÎNE VIDE POUR LE FORMULAIRE
                            field.onChange(value === "none" ? "" : value);
                          }}
                          value={field.value === "" ? "none" : field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez un service" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {/* 🔥 UTILISER "none" AU LIEU DE "" */}
                            <SelectItem value="none">
                              <span className="text-muted-foreground">
                                Aucun service
                              </span>
                            </SelectItem>
                            {services.map((service) => (
                              <SelectItem
                                key={service.id}
                                value={service.id.toString()}
                              >
                                {service.name} ({service.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Assignez l'utilisateur à un service municipal
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Utilisateur actif
                          </FormLabel>
                          <FormDescription>
                            L'utilisateur peut se connecter et utiliser le
                            système
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Notes administratives sur l'utilisateur..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Notes internes visibles uniquement par les
                          administrateurs
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            )}
          </div>

          <DrawerFooter className="border-t">
            {editMode ? (
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (mode === "create") {
                      onOpenChange(false);
                    } else {
                      setEditMode(false);
                    }
                  }}
                  disabled={loading}
                >
                  Annuler
                </Button>
                <Button
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <IconCar className="mr-2 h-4 w-4" />
                      {mode === "create" ? "Créer" : "Sauvegarder"}
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex justify-end">
                <DrawerClose asChild>
                  <Button variant="outline">Fermer</Button>
                </DrawerClose>
              </div>
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <IconAlertCircle className="h-5 w-5 text-destructive" />
              <span>Confirmer la suppression</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l'utilisateur{" "}
              <strong>
                {user?.firstName} {user?.lastName}
              </strong>{" "}
              ? Cette action est irréversible et supprimera également toutes les
              données associées à cet utilisateur.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={loading}
            >
              {loading ? (
                <>
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                "Supprimer"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
