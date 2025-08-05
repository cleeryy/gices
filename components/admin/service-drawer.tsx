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
    if (service)
      setFormData({
        name: service.name,
        code: service.code,
        mailType: service.mailType,
        isActive: service.isActive,
      });
    else
      setFormData({
        name: "",
        code: "",
        mailType: "BOTH",
        isActive: true,
      });
  }, [service]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const method = service && service.id ? "PUT" : "POST";
      const url =
        service && service.id ? `/api/services/${service.id}` : "/api/services";
      const dataToSend = { ...formData };
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
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
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="p-4">
        <DrawerHeader>
          <DrawerTitle>
            {service ? "Modifier un service" : "Ajouter un service"}
          </DrawerTitle>
          <DrawerDescription>
            Renseignez les informations du service
          </DrawerDescription>
        </DrawerHeader>

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
        <DrawerFooter>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
