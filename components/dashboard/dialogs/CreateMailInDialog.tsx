"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import {
  MailInFormData,
  ServiceData,
  ContactData,
} from "@/components/types/dashboard";

interface CreateMailInDialogProps {
  services: ServiceData[];
  contactsIn: ContactData[];
  council: any[];
  onSuccess?: () => void;
  trigger: React.ReactNode;
}

export function CreateMailInDialog({
  services,
  contactsIn,
  council,
  onSuccess,
  trigger,
}: CreateMailInDialogProps) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  const onSubmit = async (data: MailInFormData) => {
    setSubmitting(true);
    setSubmitError(null);

    try {
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

      const res = await fetch("/api/mail-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!result.success) {
        throw new Error(result.error || "Erreur lors de la création");
      }

      form.reset();
      setOpen(false);
      onSuccess?.();
    } catch (err: any) {
      setSubmitError(err.message || "Erreur serveur");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Créer un courrier entrant</DialogTitle>
          <DialogDescription>
            Enregistrez un nouveau courrier reçu par la mairie
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date de réception</Label>
              <Input
                id="date"
                type="date"
                {...form.register("date", { required: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Objet du courrier</Label>
              <Input
                id="subject"
                placeholder="Objet du courrier"
                {...form.register("subject", { required: true })}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Options spéciales</Label>
            <div className="flex gap-6">
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

          <div className="space-y-2">
            <Label htmlFor="serviceIds">
              Services concernés (IDs séparés par virgule)
            </Label>
            <Input
              id="serviceIds"
              placeholder="Ex: 1, 2, 3"
              {...form.register("serviceIds")}
            />
            <p className="text-xs text-muted-foreground">
              Services disponibles:{" "}
              {services.map((s) => `${s.id}: ${s.name}`).join(", ")}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="councilIds">
              Conseillers en copie (IDs séparés par virgule)
            </Label>
            <Input
              id="councilIds"
              placeholder="Ex: 1, 2"
              {...form.register("councilIds")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactIds">
              Expéditeurs (IDs séparés par virgule)
            </Label>
            <Input
              id="contactIds"
              placeholder="Ex: 1, 2"
              {...form.register("contactIds")}
            />
            <p className="text-xs text-muted-foreground">
              Contacts disponibles:{" "}
              {contactsIn.map((c) => `${c.id}: ${c.name}`).join(", ")}
            </p>
          </div>

          {submitError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                "Créer le courrier"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
