import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useState, useEffect } from "react";

interface Service {
  id: number;
  name: string;
  code: string;
}

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

interface UserDrawerProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function UserDrawer({
  user,
  open,
  onOpenChange,
  onSuccess,
}: UserDrawerProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [loading, setLoading] = useState(false);
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
    role: "USER",
    isActive: true,
    serviceId: 0,
    password: "",
  });

  useEffect(() => {
    // Fetch all services for the select
    setServicesLoading(true);
    fetch("/api/services?limit=1000")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && Array.isArray(data.data.data)) {
          setServices(data.data.data);
        } else {
          setServices([]);
        }
      })
      .catch(() => setServices([]))
      .finally(() => setServicesLoading(false));
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
      // Do not send password field for PUT if unchanged
      const dataToSend = { ...formData };
      if (user) delete dataToSend.password;
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) throw new Error();
      toast.success(user ? "Utilisateur modifié" : "Utilisateur créé");
      onSuccess();
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    }
    setLoading(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="p-4">
        <DrawerHeader>
          <DrawerTitle>
            {user ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
          </DrawerTitle>
          <DrawerDescription>
            {user
              ? "Modifiez les informations de l'utilisateur"
              : "Créez un nouvel utilisateur"}
          </DrawerDescription>
        </DrawerHeader>
        <div className="grid gap-4 py-4">
          {/* ID */}
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
              disabled={!!user}
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
          {/* Service */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="service" className="text-right">
              Service
            </Label>
            <Select
              value={formData.serviceId ? formData.serviceId.toString() : ""}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  serviceId: Number(value),
                })
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
                      {service.name} ({service.code})
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
          {/* Mot de passe (création uniquement) */}
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
          {/* Actif */}
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
        <DrawerFooter>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
