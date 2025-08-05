"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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
  password?: string;
}

interface Service {
  id: number;
  name: string;
  code: string;
}

interface UserDrawerProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface Service {
  id: number;
  name: string;
  code: string;
  mailType: string;
  isActive: boolean;
  _count: {
    users: number;
  };
}

export function UserDrawer({
  user,
  open,
  onOpenChange,
  onSuccess,
}: UserDrawerProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(true);

  const [formData, setFormData] = useState<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: "USER" | "ADMIN";
    isActive: boolean;
    serviceId: number;
    password?: string;
  }>({
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    role: "USER" as "USER" | "ADMIN",
    isActive: true,
    serviceId: 0,
    password: "",
  });

  useEffect(() => {
    const fetchServices = async () => {
      setServicesLoading(true);
      try {
        // ✅ Récupère tous les services avec une limite élevée pour éviter la pagination
        const response = await fetch("/api/services?limit=1000");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Services API response:", result); // Debug

        // ✅ Gestion de la structure de réponse de ton API
        if (result.success && result.data) {
          const servicesData = result.data.data; // ← Le tableau est dans data.data

          if (Array.isArray(servicesData)) {
            setServices(servicesData);
          } else {
            console.error("servicesData n'est pas un tableau:", servicesData);
            setServices([]);
          }
        } else {
          console.error("Réponse API invalide:", result);
          setServices([]);
        }
      } catch (error) {
        console.error("Erreur lors du fetch des services:", error);
        toast.error("Erreur lors du chargement des services");
        setServices([]);
      } finally {
        setServicesLoading(false);
      }
    };

    fetchServices();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email || "",
        role: user.role,
        isActive: user.isActive,
        serviceId: user.serviceId,
      });
    } else {
      setFormData({
        id: "",
        firstName: "",
        lastName: "",
        email: "",
        role: "USER",
        isActive: true,
        serviceId: 0,
        password: "",
      });
    }
  }, [user]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const method = user ? "PUT" : "POST";
      const url = user ? `/api/users/${user.id}` : "/api/users";

      const dataToSend = { ...formData };
      if (user) delete dataToSend.password;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Erreur");

      toast.success(user ? "Utilisateur modifié" : "Utilisateur créé");
      onSuccess();
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>
            {user ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
          </SheetTitle>
          <SheetDescription>
            {user
              ? "Modifiez les informations de l'utilisateur"
              : "Créez un nouvel utilisateur"}
          </SheetDescription>
        </SheetHeader>

        <div className="grid gap-4 py-4">
          {/* ID Field */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="id" className="text-right">
              ID
            </Label>
            <Input
              id="id"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              className="col-span-3"
              maxLength={4}
              placeholder="4 lettres exactement"
              disabled={!!user} // Désactiver en mode édition
            />
          </div>

          {/* Prénom */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="firstName" className="text-right">
              Prénom
            </Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              className="col-span-3"
            />
          </div>

          {/* Nom */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lastName" className="text-right">
              Nom
            </Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              className="col-span-3"
            />
          </div>

          {/* Email */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="col-span-3"
            />
          </div>

          {/* Rôle */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Rôle
            </Label>
            <Select
              value={formData.role}
              onValueChange={(value: "USER" | "ADMIN") =>
                setFormData({ ...formData, role: value })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">Utilisateur</SelectItem>
                <SelectItem value="ADMIN">Administrateur</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Service - CORRECTION ICI */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="service" className="text-right">
              Service
            </Label>
            <Select
              value={formData.serviceId.toString()}
              onValueChange={(value) =>
                setFormData({ ...formData, serviceId: parseInt(value) })
              }
              disabled={servicesLoading}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue
                  placeholder={
                    servicesLoading
                      ? "Chargement..."
                      : "Sélectionner un service"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {servicesLoading ? (
                  <SelectItem value="" disabled>
                    Chargement des services...
                  </SelectItem>
                ) : services.length > 0 ? (
                  services.map((service) => (
                    <SelectItem key={service.id} value={service.id.toString()}>
                      {service.name} ({service.code}) - {service._count.users}{" "}
                      utilisateurs
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    Aucun service disponible
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Mot de passe pour nouveau user */}
          {!user && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Mot de passe
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="col-span-3"
                placeholder="8 caractères exactement"
              />
            </div>
          )}

          {/* Statut actif */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isActive" className="text-right">
              Actif
            </Label>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isActive: checked })
              }
            />
          </div>
        </div>

        <SheetFooter>
          <Button onClick={handleSubmit} disabled={loading || servicesLoading}>
            {loading ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
