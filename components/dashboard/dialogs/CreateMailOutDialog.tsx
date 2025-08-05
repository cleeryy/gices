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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import {
  MailOutFormData,
  ServiceData,
  ContactData,
} from "@/components/types/dashboard";

interface CreateMailOutDialogProps {
  services: ServiceData[];
  contactsOut: ContactData[];
  onSuccess?: () => void;
  trigger: React.ReactNode;
}

export function CreateMailOutDialog({
  services,
  contactsOut,
  onSuccess,
  trigger,
}: CreateMailOutDialogProps) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<MailOutFormData>({
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      subject: "",
      reference: "",
      serviceId: "",
      contactIds: "",
    },
  });

  const onSubmit = async (data: MailOutFormData) => {
    const user = session?.user as any;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        date: new Date(data.date),
        subject: data.subject,
        reference: data.reference,
        serviceId: parseInt(data.serviceId),
        userId: user.id,
        contactIds: data.contactIds
          ? data.contactIds
              .split(",")
              .map((id) => parseInt(id.trim()))
              .filter((id) => !isNaN(id))
          : [],
      };

      const res = await fetch("/api/mail-out", {
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
          <DialogTitle>Créer un courrier sortant</DialogTitle>
          <DialogDescription>
            Enregistrez un nouveau courrier envoyé par la mairie
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date-out">Date d'envoi</Label>
              <Input
                id="date-out"
                type="date"
                {...form.register("date", { required: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reference">Référence</Label>
              <Input
                id="reference"
                placeholder="REF-2025-001"
                {...form.register("reference", { required: true })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject-out">Objet du courrier</Label>
            <Input
              id="subject-out"
              placeholder="Objet du courrier"
              {...form.register("subject", { required: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="serviceId">Service expéditeur</Label>
            <Select
              onValueChange={(value) => form.setValue("serviceId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un service" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id.toString()}>
                    {service.name} ({service.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactIds-out">
              Expéditeurs (IDs séparés par virgule)
            </Label>
            <Input
              id="contactIds-out"
              placeholder="Ex: 1, 2, 3"
              {...form.register("contactIds")}
            />
            <p className="text-xs text-muted-foreground">
              Contacts disponibles:{" "}
              {contactsOut
                .slice(0, 3)
                .map((c) => `${c.id}: ${c.name}`)
                .join(", ")}
              {contactsOut.length > 3 &&
                ` ... (+${contactsOut.length - 3} autres)`}
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
