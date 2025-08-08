"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Eye,
  MoreHorizontal,
  AlertCircle,
  Pencil,
  Calendar as CalendarIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import LoadIfAdmin from "@/components/admin/LoadIfAdmin";

// Types
interface MailInItem {
  id: number;
  date: string;
  subject: string;
  needsMayor: boolean;
  needsDgs: boolean;
  services: {
    service: { id: number; name: string; code: string };
    type: "INFO" | "SUIVI";
  }[];
  _count: { copies: number; recipients: number };
  copies?: {
    council?: {
      id: number;
      firstName?: string;
      lastName?: string;
      position?: string;
    };
  }[];
  recipients?: { contact?: { id: number; name: string } }[];
}

interface ServiceData {
  id: number;
  name: string;
  code: string;
}
interface CouncilData {
  id: number;
  firstName?: string;
  lastName?: string;
  position?: string;
}
interface ContactData {
  id: number;
  name: string;
}

interface HistoryTableProps {
  searchQuery?: string;
  filters?: {
    needsMayor?: boolean;
    needsDgs?: boolean;
    serviceIds?: number[];
    contactIds?: number[];
    dateFrom?: Date;
    dateTo?: Date;
  };
  page?: number;
  limit?: number;
  onDataLoaded: (total: number) => void;
}

export function HistoryTable({
  searchQuery = "",
  filters = {},
  page = 1,
  limit = 10,
  onDataLoaded,
}: HistoryTableProps) {
  const { data: session, status } = useSession();
  const [mailItems, setMailItems] = useState<MailInItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Drawer states
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MailInItem | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Edit states
  const [editedSubject, setEditedSubject] = useState("");
  const [editedNeedsMayor, setEditedNeedsMayor] = useState(false);
  const [editedNeedsDgs, setEditedNeedsDgs] = useState(false);
  const [editedDate, setEditedDate] = useState<Date>(new Date());
  const [editedServicesInfo, setEditedServicesInfo] = useState<number[]>([]);
  const [editedServicesSuivi, setEditedServicesSuivi] = useState<number[]>([]);
  const [editedCouncilIds, setEditedCouncilIds] = useState<number[]>([]);
  const [editedExpediteur, setEditedExpediteur] = useState("");

  // Data
  const [servicesData, setServicesData] = useState<ServiceData[]>([]);
  const [councilData, setCouncilData] = useState<CouncilData[]>([]);
  const [contactsData, setContactsData] = useState<ContactData[]>([]);

  // Calendar
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    if (!drawerOpen) {
      const timeout = setTimeout(() => {
        setEditMode(false);
        setSelectedItem(null);
        setEditedSubject("");
        setEditedExpediteur("");
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [drawerOpen]);

  useEffect(() => {
    const loadEditData = async () => {
      try {
        const [servicesRes, councilRes, contactsRes] = await Promise.all([
          fetch("/api/services"),
          fetch("/api/council"),
          fetch("/api/contacts-in"),
        ]);
        const [services, council, contacts] = await Promise.all([
          servicesRes.json(),
          councilRes.json(),
          contactsRes.json(),
        ]);
        setServicesData(
          services.success ? services.data?.data || services.data || [] : []
        );
        setCouncilData(
          council.success ? council.data?.data || council.data || [] : []
        );
        setContactsData(
          contacts.success ? contacts.data?.data || contacts.data || [] : []
        );
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      }
    };
    loadEditData();
  }, []);

  useEffect(() => {
    if (status !== "authenticated") {
      if (status === "unauthenticated") onDataLoaded(0);
      setLoading(false);
      return;
    }
    const fetchMailHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const searchParams = new URLSearchParams();
        if (searchQuery) searchParams.append("query", searchQuery);
        searchParams.append("page", page.toString());
        searchParams.append("limit", limit.toString());
        if (filters.needsMayor !== undefined)
          searchParams.append("needsMayor", filters.needsMayor.toString());
        if (filters.needsDgs !== undefined)
          searchParams.append("needsDgs", filters.needsDgs.toString());
        if (filters.dateFrom)
          searchParams.append("dateFrom", filters.dateFrom.toISOString());
        if (filters.dateTo)
          searchParams.append("dateTo", filters.dateTo.toISOString());
        if (filters.serviceIds && filters.serviceIds.length > 0)
          searchParams.append("serviceIds", filters.serviceIds.join(","));
        if (filters.contactIds && filters.contactIds.length > 0)
          searchParams.append("contactIds", filters.contactIds.join(","));

        const response = await fetch(`/api/mail-in?${searchParams}`);
        const data = await response.json();

        if (data.success) {
          const items = Array.isArray(data.data?.data) ? data.data.data : [];
          const totalCount = data.data?.pagination?.total || items.length;
          setMailItems(items);
          onDataLoaded(totalCount);
        } else {
          throw new Error(
            data.message || "Erreur lors de la récupération des données."
          );
        }
      } catch (err: any) {
        setError(err.message || "Une erreur est survenue.");
        setMailItems([]);
        onDataLoaded(0);
      } finally {
        setLoading(false);
      }
    };
    fetchMailHistory();
  }, [searchQuery, filters, page, limit, status, onDataLoaded]);

  // ---------- HANDLERS MEMORISES ----------
  const handleSubjectChange = useCallback(
    // @ts-expect-error
    (e) => setEditedSubject(e.target.value),
    []
  );
  const handleExpediteurChange = useCallback(
    // @ts-expect-error
    (e) => setEditedExpediteur(e.target.value),
    []
  );
  const handleNeedsMayorChange = useCallback(
    // @ts-expect-error
    (checked) => setEditedNeedsMayor(checked),
    []
  );
  const handleNeedsDgsChange = useCallback(
    // @ts-expect-error
    (checked) => setEditedNeedsDgs(checked),
    []
  );
  // @ts-expect-error
  const handleDateChange = useCallback((date) => {
    if (date) setEditedDate(date);
  }, []);
  // @ts-expect-error
  const handleServiceInfoToggle = useCallback((serviceId, checked) => {
    setEditedServicesInfo((prev) =>
      checked ? [...prev, serviceId] : prev.filter((id) => id !== serviceId)
    );
  }, []);
  // @ts-expect-error
  const handleServiceSuiviToggle = useCallback((serviceId, checked) => {
    setEditedServicesSuivi((prev) =>
      checked ? [...prev, serviceId] : prev.filter((id) => id !== serviceId)
    );
  }, []);
  // @ts-expect-error
  const handleCouncilToggle = useCallback((memberId, checked) => {
    setEditedCouncilIds((prev) =>
      checked ? [...prev, memberId] : prev.filter((id) => id !== memberId)
    );
  }, []);

  // ---------- BADGES & RENDERS ----------
  const getStatusBadges = (item: MailInItem) => {
    const badges = [];
    if (item.needsMayor)
      badges.push(
        <Badge
          key="mayor"
          variant="default"
          className="bg-primary text-primary-foreground"
        >
          MAIRE requis
        </Badge>
      );
    if (item.needsDgs)
      badges.push(
        <Badge
          key="dgs"
          variant="secondary"
          className="bg-secondary text-secondary-foreground"
        >
          DGS requis
        </Badge>
      );
    return badges;
  };

  const getServicesByType = (
    services: MailInItem["services"],
    type: "INFO" | "SUIVI"
  ) => {
    if (!services) return [];
    return services
      .filter((s) => s.type === type)
      .map((s) => s.service.code)
      .filter(Boolean);
  };
  const getServicesByTypeIds = (
    services: MailInItem["services"],
    type: "INFO" | "SUIVI"
  ) => {
    if (!services) return [];
    return services
      .filter((s) => s.type === type)
      .map((s) => s.service.id)
      .filter(Boolean);
  };

  const renderServiceBadges = (codes: string[]) =>
    codes.length === 0 ? (
      <span className="text-muted-foreground text-sm">Aucun</span>
    ) : (
      <div className="flex flex-wrap gap-1">
        {codes.map((code) => (
          <Badge key={code} variant="outline" className="text-xs">
            {code}
          </Badge>
        ))}
      </div>
    );

  const renderCopies = (item: MailInItem) => {
    if (!item.copies || item.copies.length === 0)
      return <span className="text-muted-foreground">Aucune copie</span>;
    return (
      <ul className="pl-3 list-disc space-y-0.5">
        {item.copies.map((copy, idx) => (
          <li key={idx}>
            {copy.council
              ? `${copy.council.firstName || ""} ${
                  copy.council.lastName || ""
                }`.trim()
              : "—"}
          </li>
        ))}
      </ul>
    );
  };

  const renderRecipients = (item: MailInItem) => {
    if (!item.recipients || item.recipients.length === 0)
      return <span className="text-muted-foreground">Aucun destinataire</span>;
    return (
      <ul className="pl-3 list-disc space-y-0.5">
        {item.recipients.map((rec, idx) => (
          <li key={idx}>{rec.contact ? rec.contact.name : "—"}</li>
        ))}
      </ul>
    );
  };

  // ---------- EDITION ----------
  const handleOpenDetails = useCallback((item: MailInItem) => {
    setSelectedItem(item);
    setDrawerOpen(true);
    setEditMode(false);
    setEditedSubject(item.subject);
  }, []);

  const handleOpenEdit = useCallback((item: MailInItem) => {
    setSelectedItem(item);
    setDrawerOpen(true);
    setEditMode(true);
    setEditedSubject(item.subject);
    setEditedNeedsMayor(item.needsMayor);
    setEditedNeedsDgs(item.needsDgs);
    setEditedDate(new Date(item.date));
    setEditedServicesInfo(getServicesByTypeIds(item.services, "INFO"));
    setEditedServicesSuivi(getServicesByTypeIds(item.services, "SUIVI"));
    setEditedCouncilIds(
      item.copies?.map((copy) => copy.council?.id).filter(Boolean) as number[]
    );
    const expediteur = item.recipients?.[0]?.contact?.name || "";
    setEditedExpediteur(expediteur);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!selectedItem) return;
    try {
      let expediteurId = null;
      const trimmedExp = editedExpediteur.trim();
      if (trimmedExp) {
        const existing = contactsData.find(
          (c) => c.name.toLowerCase() === trimmedExp.toLowerCase()
        );
        if (existing) expediteurId = existing.id;
        else {
          const response = await fetch("/api/contacts-in", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: trimmedExp }),
          });
          const result = await response.json();
          if (result.success) expediteurId = result.data.id;
        }
      }

      const serviceDestinations = [
        ...editedServicesInfo.map((serviceId) => ({
          serviceId,
          type: "INFO" as const,
        })),
        ...editedServicesSuivi
          .filter((sid) => !editedServicesInfo.includes(sid))
          .map((serviceId) => ({ serviceId, type: "SUIVI" as const })),
      ];
      const updateData = {
        date: editedDate,
        subject: editedSubject,
        needsMayor: editedNeedsMayor,
        needsDgs: editedNeedsDgs,
        serviceDestinations,
        councilIds: editedCouncilIds,
        contactIds: expediteurId ? [expediteurId] : [],
      };
      const response = await fetch(`/api/mail-in/${selectedItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      const result = await response.json();
      if (result.success) {
        setMailItems((prevItems) =>
          prevItems.map((item) =>
            item.id === selectedItem.id ? { ...item, ...result.data } : item
          )
        );
        setEditMode(false);
        toast.success("Courrier modifié avec succès !");
      } else {
        throw new Error(result.message || "Erreur lors de la modification");
      }
    } catch (error: any) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error(error.message || "Erreur lors de la modification");
    }
  }, [
    selectedItem,
    editedExpediteur,
    contactsData,
    editedServicesInfo,
    editedServicesSuivi,
    editedCouncilIds,
    editedDate,
    editedSubject,
    editedNeedsMayor,
    editedNeedsDgs,
  ]);

  // ---------- VIEW DETAILS MEMO ----------
  const ViewDetails = useMemo(() => {
    if (!selectedItem) {
      return null;
    }
    return (
      <div>
        <div className="p-6 space-y-4">
          <div className="flex gap-6">
            <div className="min-w-[110px] text-muted-foreground font-medium">
              Date :
            </div>
            <div>
              {selectedItem.date ? (
                format(new Date(selectedItem.date), "dd MMM yyyy", {
                  locale: fr,
                })
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </div>
          </div>
          <Separator />
          <div className="flex gap-6">
            <div className="min-w-[110px] text-muted-foreground font-medium">
              Objet :
            </div>
            <div>
              {selectedItem.subject ?? (
                <span className="text-muted-foreground">—</span>
              )}
            </div>
          </div>
          <Separator />
          <div className="flex gap-6">
            <div className="min-w-[110px] text-muted-foreground font-medium">
              Statut :
            </div>
            <div className="flex gap-2">{getStatusBadges(selectedItem)}</div>
          </div>
          <Separator />
          <div className="flex gap-6">
            <div className="min-w-[110px] text-muted-foreground font-medium">
              INFO :
            </div>
            <div>
              {renderServiceBadges(
                getServicesByType(selectedItem.services, "INFO")
              )}
            </div>
          </div>
          <Separator />
          <div className="flex gap-6">
            <div className="min-w-[110px] text-muted-foreground font-medium">
              SUIVI :
            </div>
            <div>
              {renderServiceBadges(
                getServicesByType(selectedItem.services, "SUIVI")
              )}
            </div>
          </div>
          <Separator />
          <div className="flex gap-6">
            <div className="min-w-[110px] text-muted-foreground font-medium">
              Élus :
            </div>
            <div>{renderCopies(selectedItem)}</div>
          </div>
          <Separator />
          <div className="flex gap-6">
            <div className="min-w-[110px] text-muted-foreground font-medium">
              Expéditeurs :
            </div>
            <div>{renderRecipients(selectedItem)}</div>
          </div>
        </div>
        <DrawerFooter className="gap-2 pb-6">
          <LoadIfAdmin>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setEditMode(true)}
            >
              <Pencil className="inline w-4 h-4 mr-2" />
              Modifier
            </Button>
          </LoadIfAdmin>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() => setDrawerOpen(false)}
          >
            Fermer
          </Button>
        </DrawerFooter>
      </div>
    );
  }, [selectedItem]);

  // ---------- EDIT FORM MEMO ----------
  const EditForm = useMemo(
    () => (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSaveEdit();
        }}
        autoComplete="off"
      >
        <div className="p-6 flex flex-col gap-6 max-h-[50vh] overflow-y-auto">
          {/* Date */}
          <div className="space-y-2">
            <Label className="font-medium text-sm text-muted-foreground">
              Date :
            </Label>
            <Drawer open={calendarOpen} onOpenChange={setCalendarOpen}>
              <DrawerTrigger asChild>
                <Button
                  variant="outline"
                  type="button"
                  className="w-full justify-start"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(editedDate, "PPP", { locale: fr })}
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Sélectionner la date</DrawerTitle>
                </DrawerHeader>
                <div className="p-4 flex justify-center">
                  <Calendar
                    mode="single"
                    selected={editedDate}
                    onSelect={(date) => {
                      handleDateChange(date);
                      setCalendarOpen(false);
                    }}
                    locale={fr}
                    initialFocus
                  />
                </div>
              </DrawerContent>
            </Drawer>
          </div>
          {/* Expéditeur Champ Unique */}
          <div className="space-y-3">
            <Label className="font-medium text-sm text-muted-foreground">
              Expéditeur :
            </Label>
            <Input
              value={editedExpediteur}
              onChange={handleExpediteurChange}
              placeholder="Nom de l'expéditeur..."
            />
          </div>
          {/* Objet */}
          <div className="space-y-2">
            <Label className="font-medium text-sm text-muted-foreground">
              Objet :
            </Label>
            <Input
              value={editedSubject}
              onChange={handleSubjectChange}
              placeholder="Objet du courrier"
            />
          </div>
          {/* Services */}
          <div className="space-y-3">
            <Label className="font-medium text-sm text-muted-foreground">
              Services :
            </Label>
            <div className="grid gap-3">
              {servicesData.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="font-medium">{service.name}</div>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={editedServicesInfo.includes(service.id)}
                        onCheckedChange={(checked) =>
                          handleServiceInfoToggle(service.id, checked)
                        }
                        className="data-[state=checked]:bg-green-500"
                      />
                      <span className="text-xs text-green-700 font-medium">
                        INFO
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={editedServicesSuivi.includes(service.id)}
                        onCheckedChange={(checked) =>
                          handleServiceSuiviToggle(service.id, checked)
                        }
                        className="data-[state=checked]:bg-blue-600"
                      />
                      <span className="text-xs text-blue-600 font-medium">
                        SUIVI
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Élus */}
          <div className="space-y-3">
            <Label className="font-medium text-sm text-muted-foreground">
              Élus :
            </Label>
            <div className="grid gap-2">
              {councilData.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">
                      {member.firstName} {member.lastName}
                    </div>
                    {member.position && (
                      <div className="text-sm text-muted-foreground">
                        {member.position}
                      </div>
                    )}
                  </div>
                  <Switch
                    checked={editedCouncilIds.includes(member.id)}
                    onCheckedChange={(checked) =>
                      handleCouncilToggle(member.id, checked)
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        <DrawerFooter className="gap-2 pb-6">
          <Button type="submit" className="w-full">
            Sauvegarder
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() => setEditMode(false)}
          >
            Annuler
          </Button>
        </DrawerFooter>
      </form>
    ),
    [
      calendarOpen,
      editedDate,
      handleDateChange,
      editedExpediteur,
      handleExpediteurChange,
      editedSubject,
      handleSubjectChange,
      servicesData,
      editedServicesInfo,
      handleServiceInfoToggle,
      editedServicesSuivi,
      handleServiceSuiviToggle,
      councilData,
      editedCouncilIds,
      handleCouncilToggle,
      handleSaveEdit,
      setCalendarOpen,
      setEditMode,
    ]
  );

  // ---------- RENDER DRAWER CONTENT ----------
  const renderDrawerContent = useCallback(() => {
    if (!selectedItem) return null;
    return (
      <DrawerContent>
        <DrawerHeader className="border-b border-muted p-6 bg-muted/50 m-4 rounded-xl">
          <DrawerTitle className="text-lg flex items-center gap-2">
            {editMode ? (
              <>
                <Pencil className="inline w-5 h-5 text-primary" /> Modifier le
                courrier
              </>
            ) : (
              <>
                <Eye className="inline w-5 h-5 text-primary" /> Détails du
                courrier
              </>
            )}
          </DrawerTitle>
        </DrawerHeader>
        {editMode ? EditForm : ViewDetails}
      </DrawerContent>
    );
  }, [selectedItem, editMode, EditForm, ViewDetails]);

  // ---------- RENDU PRINCIPAL ----------
  if (loading || status === "loading") {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Chargement de l'historique...
      </div>
    );
  }
  if (status === "unauthenticated") {
    return (
      <div className="text-center py-8 text-destructive-foreground bg-destructive/80 rounded-md">
        <AlertCircle className="mx-auto h-8 w-8 mb-2" />
        Vous devez être connecté pour voir l'historique.
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-center py-8 text-destructive-foreground bg-destructive/80 rounded-md">
        <AlertCircle className="mx-auto h-8 w-8 mb-2" />
        <p>
          <strong>Erreur de chargement</strong>
        </p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }
  if (mailItems.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
        <div className="text-muted-foreground">
          {searchQuery ||
          Object.values(filters).some(
            (v) => v !== undefined && (!Array.isArray(v) || v.length > 0)
          )
            ? "Aucun résultat trouvé pour votre recherche"
            : "Aucun courrier dans l'historique"}
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card shadow-lg">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/80 border-border">
            <TableHead className="text-foreground font-semibold py-4">
              Date
            </TableHead>
            <TableHead className="text-foreground font-semibold">
              Objet
            </TableHead>
            <TableHead className="text-foreground font-semibold">
              INFO
            </TableHead>
            <TableHead className="text-foreground font-semibold">
              SUIVI
            </TableHead>
            <TableHead className="text-foreground font-semibold">
              Élus<span className="text-muted-foreground mx-1">/</span>{" "}
              Expéditeurs
            </TableHead>
            <TableHead className="text-foreground font-semibold w-[88px] text-center">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mailItems.map((item) => (
            <TableRow
              key={item.id}
              className="border-border hover:bg-muted/40 transition-all"
            >
              <TableCell className="text-foreground py-3">
                <div className="font-medium">
                  {format(new Date(item.date), "dd MMM yyyy", { locale: fr })}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  ID: {item.id}
                </div>
              </TableCell>
              <TableCell className="max-w-[270px]">
                <div
                  className="font-medium text-foreground truncate"
                  title={item.subject}
                >
                  {item.subject}
                </div>
              </TableCell>
              <TableCell>
                {renderServiceBadges(getServicesByType(item.services, "INFO"))}
              </TableCell>
              <TableCell>
                {renderServiceBadges(getServicesByType(item.services, "SUIVI"))}
              </TableCell>
              <TableCell className="text-foreground">
                <div className="mb-1 font-semibold text-xs text-muted-foreground">
                  Élus :
                </div>
                {renderCopies(item)}
                <div className="mt-1 mb-1 font-semibold text-xs text-muted-foreground">
                  Expéditeurs :
                </div>
                {renderRecipients(item)}
              </TableCell>
              <TableCell className="text-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-9 w-9 p-0"
                      aria-label="Ouvrir menu"
                    >
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-popover border-border"
                  >
                    <DropdownMenuItem
                      className="hover:bg-accent"
                      onClick={() => handleOpenDetails(item)}
                    >
                      <Eye className="mr-2 h-4 w-4" /> Voir détails
                    </DropdownMenuItem>
                    <LoadIfAdmin>
                      <DropdownMenuItem
                        className="hover:bg-accent"
                        onClick={() => handleOpenEdit(item)}
                      >
                        <Pencil className="mr-2 h-4 w-4" /> Modifier
                      </DropdownMenuItem>
                    </LoadIfAdmin>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Drawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        key={selectedItem?.id || "drawer"}
      >
        {renderDrawerContent()}
      </Drawer>
    </div>
  );
}
