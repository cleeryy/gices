"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Calendar } from "@/components/ui/calendar";
import {
  Loader2,
  AlertCircle,
  Calendar as CalendarIcon,
  X,
  ArrowLeft,
  Info,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface ServiceData {
  id: number;
  name: string;
}
interface CouncilData {
  id: number;
  firstName: string;
  lastName: string;
  position?: string;
}
interface ContactData {
  id: number;
  name: string;
}

// FRONT form: on gère deux états (info suivi) mais output serviceDestinations {serviceId,type}
interface FormData {
  date: Date;
  subject: string;
  needsMayor: boolean;
  needsDgs: boolean;
  servicesInfo: number[];
  servicesSuivi: number[];
  councilIds: number[];
  contactIds: number[];
  newContacts: string[];
}

export default function CreateMailInPage() {
  // Chargement des données
  const [services, setServices] = useState<ServiceData[]>([]);
  const [council, setCouncil] = useState<CouncilData[]>([]);
  const [contacts, setContacts] = useState<ContactData[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [s, c, m] = await Promise.all([
          fetch("/api/services").then((r) => r.json()),
          fetch("/api/council").then((r) => r.json()),
          fetch("/api/contacts-in").then((r) => r.json()),
        ]);
        setServices(s.success ? s.data?.data || s.data || [] : []);
        setCouncil(c.success ? c.data?.data || c.data || [] : []);
        setContacts(m.success ? m.data?.data || m.data || [] : []);
      } catch (err) {}
    })();
  }, []);

  const form = useForm<FormData>({
    defaultValues: {
      date: new Date(),
      subject: "",
      needsMayor: false,
      needsDgs: false,
      servicesInfo: [],
      servicesSuivi: [],
      councilIds: [],
      contactIds: [],
      newContacts: [],
    },
  });

  // Drawer calendrier
  const [calendarDrawerOpen, setCalendarDrawerOpen] = useState(false);

  // Helpers switches
  const watchedInfo: number[] = form.watch("servicesInfo") ?? [];
  const watchedSuivi: number[] = form.watch("servicesSuivi") ?? [];
  const watchedCouncil = form.watch("councilIds") ?? [];

  const handleSwitch = (
    kind: "servicesInfo" | "servicesSuivi",
    id: number,
    checked: boolean
  ) => {
    const arr = form.getValues(kind) ?? [];
    if (checked) form.setValue(kind, [...arr, id]);
    else
      form.setValue(
        kind,
        arr.filter((x) => x !== id)
      );
  };

  const handleCouncilToggle = (id: number, checked: boolean) => {
    const val = form.getValues("councilIds") ?? [];
    if (checked) form.setValue("councilIds", [...val, id]);
    else
      form.setValue(
        "councilIds",
        val.filter((v) => v !== id)
      );
  };

  // Expéditeurs
  const [contactInput, setContactInput] = useState("");
  const watchedContacts = form.watch("contactIds") ?? [];
  const watchedNewContacts = form.watch("newContacts") ?? [];
  const handleAddContact = () => {
    const trimmedInput = contactInput.trim();
    if (!trimmedInput) return;
    const existing = contacts.find(
      (contact) => contact.name.toLowerCase() === trimmedInput.toLowerCase()
    );
    if (existing) {
      if (!watchedContacts.includes(existing.id)) {
        form.setValue("contactIds", [...watchedContacts, existing.id]);
      }
    } else {
      if (!watchedNewContacts.includes(trimmedInput)) {
        form.setValue("newContacts", [...watchedNewContacts, trimmedInput]);
      }
    }
    setContactInput("");
  };
  const handleContactInputKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddContact();
    }
  };
  const removeContact = (contactId: number) => {
    const newContacts = watchedContacts.filter((id) => id !== contactId);
    form.setValue("contactIds", newContacts);
  };
  const removeNewContact = (index: number) => {
    const nc = watchedNewContacts.filter((_, i) => i !== index);
    form.setValue("newContacts", nc);
  };

  // ENVOI : mapping Info/Suivi => tableau [{serviceId,type}]
  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      // Création nouveaux contacts :
      const newContactIds: number[] = [];
      for (const cName of data.newContacts) {
        const response = await fetch("/api/contacts-in", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: cName }),
        });
        const result = await response.json();
        if (result.success) {
          newContactIds.push(result.data.id);
        }
      }
      // Création du bon tableau
      const serviceDestinations: {
        serviceId: number;
        type: "INFO" | "SUIVI";
      }[] = [
        ...watchedInfo.map((serviceId) => ({
          serviceId,
          type: "INFO" as const,
        })),
        ...watchedSuivi
          .filter((sid) => !watchedInfo.includes(sid)) // évite un doublon inutile, sinon on peut garder les deux entrées type
          .map((serviceId) => ({ serviceId, type: "SUIVI" as const })),
      ];
      // Tu pourrais, si besoin, autoriser deux fois le même service (INFO et SUIVI ensemble)
      // Dans ce cas il faut ENLEVER le .filter ci-dessus.

      const payload = {
        date: data.date,
        subject: data.subject,
        needsMayor: data.needsMayor,
        needsDgs: data.needsDgs,
        serviceDestinations,
        councilIds: data.councilIds,
        contactIds: [...data.contactIds, ...newContactIds],
      };
      const res = await fetch("/api/mail-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!result.success)
        throw new Error(result.error || "Erreur lors de la création");
      form.reset();
      toast.success("Courrier ajouté !");
    } catch (err: any) {
      setSubmitError(err.message || "Erreur serveur");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container px-4 mx-auto py-6 space-y-6 max-w-3/4">
      {/* Titre */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <h1 className="text-3xl font-bold text-foreground">
          Nouveau Courrier Entrant
        </h1>
      </div>
      <Card className="p-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Date */}
          <div>
            <Label>Date de réception</Label>
            <Controller
              name="date"
              control={form.control}
              render={({ field }) => (
                <Drawer
                  open={calendarDrawerOpen}
                  onOpenChange={setCalendarDrawerOpen}
                >
                  <DrawerTrigger asChild>
                    <Button
                      variant="outline"
                      type="button"
                      className="mt-2 w-full justify-start text-left"
                      onClick={() => setCalendarDrawerOpen(true)}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value
                        ? format(field.value, "PPP", { locale: fr })
                        : "Sélectionner une date"}
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent>
                    <DrawerHeader>
                      <DrawerTitle>
                        Sélectionner la date de réception
                      </DrawerTitle>
                    </DrawerHeader>
                    <div className="p-4 flex justify-center">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date);
                          setCalendarDrawerOpen(false);
                        }}
                        locale={fr}
                        initialFocus
                      />
                    </div>
                  </DrawerContent>
                </Drawer>
              )}
            />
          </div>

          {/* Expéditeurs */}
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Label className="font-medium mb-2">Expéditeurs</Label>
              <Input
                value={contactInput}
                onChange={(e) => setContactInput(e.target.value)}
                onKeyPress={handleContactInputKeyPress}
                placeholder="Nom de l'expéditeur..."
                className="flex-1"
              />
            </div>
            <Button
              type="button"
              onClick={handleAddContact}
              disabled={!contactInput.trim()}
            >
              Ajouter
            </Button>
          </div>
          {(watchedContacts.length > 0 || watchedNewContacts.length > 0) && (
            <div className="flex flex-wrap gap-1 mt-2">
              {watchedContacts.map((cid) => {
                const c = contacts.find((c0) => c0.id === cid);
                return c ? (
                  <Badge
                    key={cid}
                    variant="default"
                    className="cursor-pointer"
                    onClick={() => removeContact(cid)}
                  >
                    {c.name}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                ) : null;
              })}
              {watchedNewContacts.map((name, idx) => (
                <Badge
                  key={`new-${idx}`}
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => removeNewContact(idx)}
                >
                  {name}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ))}
            </div>
          )}

          {/* Sujet */}
          <div>
            <Label htmlFor="subject">Objet du courrier</Label>
            <Input
              id="subject"
              placeholder="Objet du courrier"
              {...form.register("subject", { required: true })}
              className="mt-2"
            />
          </div>

          {/* Services DOUBLE SWITCH */}
          <Card className="p-4">
            <Label className="font-medium">Services concernés</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="flex flex-col gap-2 border border-border rounded-xl p-3 transition-all duration-300 bg-white/5 hover:bg-white/10"
                >
                  <div className="font-semibold">{service.name}</div>
                  <div className="flex gap-4 items-center">
                    <div className="flex items-center gap-1">
                      <Switch
                        aria-label="INFO"
                        checked={watchedInfo.includes(service.id)}
                        onCheckedChange={(checked) =>
                          handleSwitch("servicesInfo", service.id, checked)
                        }
                        className="data-[state=checked]:bg-green-500"
                      />
                      <span className="text-green-700 flex items-center text-xs font-bold">
                        <Info className="w-4 h-4 mr-1" /> INFO
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Switch
                        aria-label="SUIVI"
                        checked={watchedSuivi.includes(service.id)}
                        onCheckedChange={(checked) =>
                          handleSwitch("servicesSuivi", service.id, checked)
                        }
                        className="data-[state=checked]:bg-blue-600"
                      />
                      <span className="text-blue-600 flex items-center text-xs font-bold">
                        <Eye className="w-4 h-4 mr-1" /> SUIVI
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Aperçu des sélections */}
            {(watchedInfo.length > 0 || watchedSuivi.length > 0) && (
              <div className="mt-4 space-y-2">
                {watchedInfo.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    <span className="font-medium text-green-700">INFO :</span>
                    {watchedInfo.map((sId) => {
                      const serv = services.find((s) => s.id === sId);
                      return serv ? (
                        <Badge
                          key={sId}
                          variant="outline"
                          className="border-green-600 text-green-700"
                        >
                          {serv.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
                {watchedSuivi.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    <span className="font-medium text-blue-600">SUIVI :</span>
                    {watchedSuivi.map((sId) => {
                      const serv = services.find((s) => s.id === sId);
                      return serv ? (
                        <Badge
                          key={sId}
                          variant="outline"
                          className="border-blue-600 text-blue-600"
                        >
                          {serv.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Conseillers */}
          <Card className="p-4">
            <Label className="font-medium">Conseillers en copie</Label>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
              {council.map((councilMember) => (
                <div
                  key={councilMember.id}
                  className="flex items-center justify-between mx-2 my-1 border-border border-1 p-2 rounded-xl bg-white/5"
                >
                  <div>
                    <Label htmlFor={`council-${councilMember.id}`}>
                      {councilMember.firstName} {councilMember.lastName}
                    </Label>
                    <Label
                      htmlFor={`council-${councilMember.id}-title`}
                      className="text-muted-foreground block"
                    >
                      {councilMember.position && <>{councilMember.position}</>}
                    </Label>
                  </div>
                  <Switch
                    id={`council-${councilMember.id}`}
                    checked={watchedCouncil.includes(councilMember.id)}
                    onCheckedChange={(checked) =>
                      handleCouncilToggle(councilMember.id, checked)
                    }
                  />
                </div>
              ))}
            </div>
            {watchedCouncil.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {watchedCouncil.map((id) => {
                  const m = council.find((c) => c.id === id);
                  return m ? (
                    <Badge key={id} variant="outline">
                      {m.firstName} {m.lastName}
                    </Badge>
                  ) : null;
                })}
              </div>
            )}
          </Card>

          {/* Erreur */}
          {submitError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
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
          </div>
        </form>
      </Card>
    </div>
  );
}
