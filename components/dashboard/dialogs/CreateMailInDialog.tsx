"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import debounce from "lodash/debounce";
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
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Loader2,
  AlertCircle,
  Calendar as CalendarIcon,
  Check,
  X,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
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

interface FormData {
  date: Date;
  subject: string;
  needsMayor: boolean;
  needsDgs: boolean;
  serviceIds: number[];
  councilIds: number[];
  contactIds: number[];
  newContacts: string[];
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

  const [servicesOpen, setServicesOpen] = useState(false);
  const [councilOpen, setCouncilOpen] = useState(false);

  // "Expéditeurs"
  const [contactInput, setContactInput] = useState("");
  const [filteredContacts, setFilteredContacts] = useState<ContactData[]>([]);
  const [contactsOpen, setContactsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const keepPopoverOpen = useRef(false);

  const form = useForm<FormData>({
    defaultValues: {
      date: new Date(),
      subject: "",
      needsMayor: false,
      needsDgs: false,
      serviceIds: [],
      councilIds: [],
      contactIds: [],
      newContacts: [],
    },
  });

  const watchedServices = form.watch("serviceIds");
  const watchedCouncil = form.watch("councilIds");
  const watchedContacts = form.watch("contactIds");
  const watchedNewContacts = form.watch("newContacts");

  // Debounce sur filtrage contactsIn
  const doFilter = useMemo(
    () =>
      debounce((value: string) => {
        setFilteredContacts(
          contactsIn.filter((contact) =>
            contact.name.toLowerCase().includes(value.toLowerCase())
          )
        );
      }, 250),
    [contactsIn]
  );

  // Input expéditeurs (focus, blur, etc) et ouverture du popover
  const handleContactInputChange = useCallback(
    (value: string) => {
      setContactInput(value);
      if (value.length >= 4) {
        setContactsOpen(true);
        doFilter(value);
      } else {
        setContactsOpen(false);
        setFilteredContacts([]);
      }
    },
    [doFilter]
  );

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    requestAnimationFrame(() => {
      if (!keepPopoverOpen.current) setContactsOpen(false);
      keepPopoverOpen.current = false;
    });
  };

  const handleAddNewContact = async (name: string) => {
    if (!name.trim()) return;
    try {
      const response = await fetch("/api/contacts-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const result = await response.json();
      if (result.success) {
        const newContact = result.data;
        const currentContactIds = form.getValues("contactIds");
        form.setValue("contactIds", [...currentContactIds, newContact.id]);
        setContactInput("");
        setContactsOpen(false);
      }
    } catch (error) {
      console.error("Erreur lors de la création du contact:", error);
    }
  };

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const newContactIds: number[] = [];
      for (const contactName of data.newContacts) {
        const response = await fetch("/api/contacts-in", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: contactName }),
        });
        const result = await response.json();
        if (result.success) {
          newContactIds.push(result.data.id);
        }
      }
      const payload = {
        date: data.date,
        subject: data.subject,
        needsMayor: data.needsMayor,
        needsDgs: data.needsDgs,
        serviceIds: data.serviceIds,
        councilIds: data.councilIds,
        contactIds: [...data.contactIds, ...newContactIds],
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

  const removeService = (serviceId: number) => {
    const newServices = watchedServices.filter((id) => id !== serviceId);
    form.setValue("serviceIds", newServices, {
      shouldDirty: true,
      shouldValidate: true,
      shouldTouch: true,
    });
  };
  const removeCouncil = (councilId: number) => {
    const newCouncil = watchedCouncil.filter((id) => id !== councilId);
    form.setValue("councilIds", newCouncil, {
      shouldDirty: true,
      shouldValidate: true,
      shouldTouch: true,
    });
  };
  const removeContact = (contactId: number) => {
    const newContacts = watchedContacts.filter((id) => id !== contactId);
    form.setValue("contactIds", newContacts, {
      shouldDirty: true,
      shouldValidate: true,
      shouldTouch: true,
    });
  };
  const removeNewContact = (index: number) => {
    const newContacts = watchedNewContacts.filter((_, i) => i !== index);
    form.setValue("newContacts", newContacts, {
      shouldDirty: true,
      shouldValidate: true,
      shouldTouch: true,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un courrier entrant</DialogTitle>
          <DialogDescription>
            Enregistrez un nouveau courrier reçu par la mairie
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date de réception</Label>
              <Controller
                name="date"
                control={form.control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value
                          ? format(field.value, "PPP", { locale: fr })
                          : "Sélectionner une date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        locale={fr}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
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
          {/* Services concernés */}
          <div className="space-y-2">
            <Label>Services concernés</Label>
            <Popover open={servicesOpen} onOpenChange={setServicesOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={servicesOpen}
                  className="w-full justify-between"
                >
                  {watchedServices.length > 0
                    ? `${watchedServices.length} service(s) sélectionné(s)`
                    : "Sélectionner des services"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Rechercher un service..." />
                  <CommandList>
                    <CommandEmpty>Aucun service trouvé.</CommandEmpty>
                    <CommandGroup>
                      {services.map((service) => (
                        <CommandItem
                          key={service.id}
                          value={service.name}
                          onSelect={() => {
                            const currentServices =
                              form.getValues("serviceIds");
                            const newServices = currentServices.includes(
                              service.id
                            )
                              ? currentServices.filter(
                                  (id) => id !== service.id
                                )
                              : [...currentServices, service.id];
                            form.setValue("serviceIds", newServices);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              watchedServices.includes(service.id)
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {service.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {watchedServices.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {watchedServices.map((serviceId) => {
                  const service = services.find((s) => s.id === serviceId);
                  return service ? (
                    <Badge
                      key={serviceId}
                      variant="secondary"
                      className="text-xs cursor-pointer"
                      tabIndex={0}
                      onClick={() => removeService(serviceId)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ")
                          removeService(serviceId);
                      }}
                    >
                      {service.name}
                      <X className="ml-1 h-3 w-3" />
                    </Badge>
                  ) : null;
                })}
              </div>
            )}
          </div>
          {/* Conseillers en copie */}
          <div className="space-y-2">
            <Label>Conseillers en copie</Label>
            <Popover open={councilOpen} onOpenChange={setCouncilOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={councilOpen}
                  className="w-full justify-between"
                >
                  {watchedCouncil.length > 0
                    ? `${watchedCouncil.length} conseiller(s) sélectionné(s)`
                    : "Sélectionner des conseillers"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Rechercher un conseiller..." />
                  <CommandList>
                    <CommandEmpty>Aucun conseiller trouvé.</CommandEmpty>
                    <CommandGroup>
                      {council.map((councilMember) => (
                        <CommandItem
                          key={councilMember.id}
                          value={`${councilMember.firstName} ${councilMember.lastName}`}
                          onSelect={() => {
                            const currentCouncil = form.getValues("councilIds");
                            const newCouncil = currentCouncil.includes(
                              councilMember.id
                            )
                              ? currentCouncil.filter(
                                  (id) => id !== councilMember.id
                                )
                              : [...currentCouncil, councilMember.id];
                            form.setValue("councilIds", newCouncil);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              watchedCouncil.includes(councilMember.id)
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {councilMember.firstName} {councilMember.lastName} -{" "}
                          {councilMember.position}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {watchedCouncil.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {watchedCouncil.map((councilId) => {
                  const councilMember = council.find((c) => c.id === councilId);
                  return councilMember ? (
                    <Badge
                      key={councilId}
                      variant="secondary"
                      className="text-xs cursor-pointer"
                      tabIndex={0}
                      onClick={() => removeCouncil(councilId)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ")
                          removeCouncil(councilId);
                      }}
                    >
                      {councilMember.firstName} {councilMember.lastName}
                      <X className="ml-1 h-3 w-3" />
                    </Badge>
                  ) : null;
                })}
              </div>
            )}
          </div>
          {/* Expéditeurs - 100% fiable */}
          <div className="space-y-2">
            <Label>Expéditeurs</Label>
            <div className="relative">
              <Input
                ref={inputRef}
                value={contactInput}
                placeholder="Rechercher ou ajouter un expéditeur (min 4 caractères)..."
                onChange={(e) => handleContactInputChange(e.target.value)}
                onFocus={(e) => {
                  if (contactInput.length >= 4) setContactsOpen(true);
                }}
                onBlur={handleBlur}
                autoComplete="off"
              />
              {contactsOpen && (
                <div
                  className="absolute left-0 w-full z-50 border rounded-md mt-1 bg-background shadow-lg popover-content"
                  onMouseDown={() => {
                    keepPopoverOpen.current = true;
                  }}
                  tabIndex={-1}
                >
                  <Command shouldFilter={false}>
                    <CommandList>
                      {contactInput.length < 4 && (
                        <div className="p-4 text-xs text-gray-400">
                          Tapez au moins 4 caractères pour rechercher un
                          expéditeur
                        </div>
                      )}
                      {contactInput.length >= 4 &&
                        filteredContacts.length > 0 && (
                          <CommandGroup heading="Contacts existants">
                            {filteredContacts.map((contact) => (
                              <CommandItem
                                key={contact.id}
                                value={contact.name}
                                onMouseDown={() => {
                                  const currentContacts =
                                    form.getValues("contactIds");
                                  if (!currentContacts.includes(contact.id)) {
                                    form.setValue("contactIds", [
                                      ...currentContacts,
                                      contact.id,
                                    ]);
                                  }
                                  setContactInput("");
                                  setContactsOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    watchedContacts.includes(contact.id)
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {contact.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}
                      {contactInput.length >= 4 &&
                        !filteredContacts.some(
                          (c) =>
                            c.name.toLowerCase() === contactInput.toLowerCase()
                        ) && (
                          <CommandGroup heading="Nouveau contact">
                            <CommandItem
                              value={contactInput}
                              onMouseDown={() => {
                                const currentNewContacts =
                                  form.getValues("newContacts");
                                if (
                                  !currentNewContacts.includes(contactInput)
                                ) {
                                  form.setValue("newContacts", [
                                    ...currentNewContacts,
                                    contactInput,
                                  ]);
                                }
                                setContactInput("");
                                setContactsOpen(false);
                              }}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Créer "{contactInput}"
                            </CommandItem>
                          </CommandGroup>
                        )}
                      {contactInput.length >= 4 &&
                        filteredContacts.length === 0 && (
                          <CommandEmpty>Aucun contact trouvé.</CommandEmpty>
                        )}
                    </CommandList>
                  </Command>
                </div>
              )}
              {(watchedContacts.length > 0 ||
                watchedNewContacts.length > 0) && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {watchedContacts.map((contactId) => {
                    const contact = contactsIn.find((c) => c.id === contactId);
                    return contact ? (
                      <Badge
                        key={contactId}
                        variant="default"
                        className="text-xs cursor-pointer"
                        tabIndex={0}
                        onClick={() => removeContact(contactId)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ")
                            removeContact(contactId);
                        }}
                      >
                        {contact.name}
                        <X className="ml-1 h-3 w-3" />
                      </Badge>
                    ) : null;
                  })}
                  {watchedNewContacts.map((contactName, index) => (
                    <Badge
                      key={`new-${index}`}
                      variant="outline"
                      className="text-xs cursor-pointer"
                      tabIndex={0}
                      onClick={() => removeNewContact(index)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ")
                          removeNewContact(index);
                      }}
                    >
                      {contactName} (nouveau)
                      <X className="ml-1 h-3 w-3" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
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
