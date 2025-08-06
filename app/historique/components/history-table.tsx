"use client";

import { useState, useEffect } from "react";
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
import { Eye, MoreHorizontal, AlertCircle, Pencil } from "lucide-react";
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
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import LoadIfAdmin from "@/components/admin/LoadIfAdmin";

interface MailInItem {
  id: number;
  date: string;
  subject: string;
  needsMayor: boolean;
  needsDgs: boolean;
  services: {
    service: {
      id: number;
      name: string;
      code: string;
    };
    type: "INFO" | "SUIVI";
  }[];
  _count: {
    copies: number;
    recipients: number;
  };
  copies?: {
    council?: {
      id: number;
      firstName?: string;
      lastName?: string;
      position?: string;
    };
  }[];
  recipients?: {
    contact?: {
      id: number;
      name: string;
    };
  }[];
}

interface HistoryTableProps {
  searchQuery?: string;
  filters?: {
    needsMayor?: boolean;
    needsDgs?: boolean;
    serviceIds?: number[];
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

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MailInItem | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedSubject, setEditedSubject] = useState("");

  useEffect(() => {
    if (!drawerOpen) {
      const timeout = setTimeout(() => {
        setEditMode(false);
        setSelectedItem(null);
        setEditedSubject("");
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [drawerOpen]);

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

        if (filters.serviceIds && filters.serviceIds.length > 0) {
          searchParams.append("serviceIds", filters.serviceIds.join(","));
        }

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

  // NOUVEAU : helpers pour colonnes INFO et SUIVI
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

  const handleOpenDetails = (item: MailInItem) => {
    setSelectedItem(item);
    setDrawerOpen(true);
    setEditMode(false);
    setEditedSubject(item.subject);
  };

  const handleOpenEdit = (item: MailInItem) => {
    setSelectedItem(item);
    setDrawerOpen(true);
    setEditMode(true);
    setEditedSubject(item.subject);
  };

  const handleSaveEdit = () => {
    if (!selectedItem) return;
    setMailItems((prev) =>
      prev.map((itm) =>
        itm.id === selectedItem.id ? { ...itm, subject: editedSubject } : itm
      )
    );
    setSelectedItem({ ...selectedItem, subject: editedSubject });
    setEditMode(false);
  };

  const renderDrawerContent = () => {
    if (!selectedItem) return null;
    return (
      <DrawerContent>
        <DrawerHeader className="border-b border-muted p-6 bg-muted/50 m-4 rounded-xl">
          <DrawerTitle className="text-lg flex items-center gap-2">
            {editMode ? (
              <>
                <Pencil className="inline w-5 h-5 text-primary" />
                Modifier le courrier
              </>
            ) : (
              <>
                <Eye className="inline w-5 h-5 text-primary" />
                Détails du courrier
              </>
            )}
          </DrawerTitle>
        </DrawerHeader>
        {editMode ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveEdit();
            }}
          >
            <div className="p-6 flex flex-col gap-4">
              <label className="flex flex-col gap-1 font-medium text-sm text-muted-foreground">
                Objet :
                <Input
                  value={editedSubject}
                  onChange={(e) => setEditedSubject(e.target.value)}
                  className="mt-1"
                />
              </label>
              {/* Ajoute d'autres inputs stylés ici */}
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
        ) : (
          <div>
            <div className="p-6 space-y-4">
              <div className="flex gap-6">
                <div className="min-w-[110px] text-muted-foreground font-medium">
                  Date :
                </div>
                <div>
                  {format(new Date(selectedItem.date), "dd MMM yyyy", {
                    locale: fr,
                  })}
                </div>
              </div>
              <Separator />
              <div className="flex gap-6">
                <div className="min-w-[110px] text-muted-foreground font-medium">
                  Objet :
                </div>
                <div>{selectedItem.subject}</div>
              </div>
              <Separator />
              <div className="flex gap-6">
                <div className="min-w-[110px] text-muted-foreground font-medium">
                  Statut :
                </div>
                <div className="flex gap-2">
                  {getStatusBadges(selectedItem)}
                </div>
              </div>
              <Separator />
              <div className="flex gap-6">
                <div className="min-w-[110px] text-muted-foreground font-medium">
                  Services INFO :
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
                  Services SUIVI :
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
                  Copies :
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
        )}
      </DrawerContent>
    );
  };

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
              Statut
            </TableHead>
            <TableHead className="text-foreground font-semibold">
              Services INFO
            </TableHead>
            <TableHead className="text-foreground font-semibold">
              Services SUIVI
            </TableHead>
            <TableHead className="text-foreground font-semibold">
              Copies <span className="text-muted-foreground mx-1">/</span>{" "}
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
                <div className="flex flex-wrap gap-1">
                  {getStatusBadges(item)}
                  {!item.needsMayor && !item.needsDgs && (
                    <Badge variant="outline" className="text-muted-foreground">
                      Standard
                    </Badge>
                  )}
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
                  Copies :
                </div>
                {renderCopies(item)}
                <div className="mt-1 mb-1 font-semibold text-xs text-muted-foreground">
                  Expéditeurs :
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
                      <Eye className="mr-2 h-4 w-4" />
                      Voir détails
                    </DropdownMenuItem>
                    <LoadIfAdmin>
                      <DropdownMenuItem
                        className="hover:bg-accent"
                        onClick={() => handleOpenEdit(item)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                    </LoadIfAdmin>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        {renderDrawerContent()}
      </Drawer>
    </div>
  );
}
