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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useState, useEffect } from "react";

interface CouncilMember {
  id?: number;
  firstName: string;
  lastName: string;
  position: string;
  login: string;
  isActive: boolean;
}

interface CouncilDrawerProps {
  councilMember: CouncilMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CouncilDrawer({
  councilMember,
  open,
  onOpenChange,
  onSuccess,
}: CouncilDrawerProps) {
  const [formData, setFormData] = useState<CouncilMember>({
    firstName: "",
    lastName: "",
    position: "",
    login: "",
    isActive: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (councilMember) {
      setFormData({
        firstName: councilMember.firstName,
        lastName: councilMember.lastName,
        position: councilMember.position,
        login: councilMember.login,
        isActive: councilMember.isActive,
      });
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        position: "",
        login: "",
        isActive: true,
      });
    }
  }, [councilMember]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const method = councilMember && councilMember.id ? "PUT" : "POST";
      const url =
        councilMember && councilMember.id
          ? `/api/council/${councilMember.id}`
          : "/api/council";
      const dataToSend = { ...formData };
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });
      if (!response.ok) throw new Error();
      toast.success(councilMember ? "Membre modifié" : "Membre ajouté");
      onSuccess();
    } catch (e: any) {
      toast.error(
        e?.body?.message ||
          "Erreur lors de la sauvegarde (login déjà utilisé ?)"
      );
    }
    setLoading(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="p-4">
        <DrawerHeader>
          <DrawerTitle>
            {councilMember ? "Modifier le membre" : "Nouveau membre"}
          </DrawerTitle>
          <DrawerDescription>
            {councilMember
              ? "Modifiez les informations de l'élus"
              : "Ajoutez un élus"}
          </DrawerDescription>
        </DrawerHeader>

        <div className="grid gap-4 py-4">
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

          {/* Position */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="position" className="text-right">
              Poste
            </Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) =>
                setFormData({ ...formData, position: e.target.value })
              }
              className="col-span-3"
            />
          </div>

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
