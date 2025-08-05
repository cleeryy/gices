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

interface Service {
  id?: number;
  name: string;
  code: string;
  mailType: string;
  isActive: boolean;
}

interface ServiceDrawerProps {
  service: Service | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ServiceDrawer({
  service,
  open,
  onOpenChange,
  onSuccess,
}: ServiceDrawerProps) {
  const [formData, setFormData] = useState<Service>({
    name: "",
    code: "",
    mailType: "BOTH",
    isActive: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (service) setFormData(service);
    else setFormData({ name: "", code: "", mailType: "BOTH", isActive: true });
  }, [service]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const method = service && service.id ? "PUT" : "POST";
      const url =
        service && service.id ? `/api/services/${service.id}` : "/api/services";
      console.log(JSON.stringify(formData));
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error();
      toast.success(service ? "Service modifié" : "Service créé");
      onSuccess();
    } catch {
      toast.error("Erreur de sauvegarde");
    }
    setLoading(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>
            {service ? "Modifier un service" : "Ajouter un service"}
          </SheetTitle>
          <SheetDescription>
            Renseignez les informations du service
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nom
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="code" className="text-right">
              Code
            </Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="mailType" className="text-right">
              Type courrier
            </Label>
            <Select
              value={formData.mailType}
              onValueChange={(mailType) =>
                setFormData({ ...formData, mailType })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IN">Entrant</SelectItem>
                <SelectItem value="OUT">Sortant</SelectItem>
                <SelectItem value="BOTH">Les deux</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isActive" className="text-right">
              Actif
            </Label>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(isActive) =>
                setFormData({ ...formData, isActive })
              }
            />
          </div>
        </div>
        <SheetFooter>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
