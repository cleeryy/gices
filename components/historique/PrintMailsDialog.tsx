"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IconPrinter } from "@tabler/icons-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

type MailInItem = {
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
};

export const PrintMailsDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [mails, setMails] = useState<MailInItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper functions pour séparer les services par type
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

  const formatServicesForPrint = (codes: string[]) => {
    return codes.length === 0 ? "Aucun" : codes.join(", ");
  };

  // Fetch mails for the selected date
  const fetchMails = useCallback(async () => {
    if (!selectedDate) return;
    setLoading(true);
    setError(null);

    try {
      const from = new Date(
        Date.UTC(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
          0,
          0,
          0,
          0
        )
      );
      const to = new Date(
        Date.UTC(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
          23,
          59,
          59,
          999
        )
      );

      const params = new URLSearchParams();
      params.append("dateFrom", from.toISOString());
      params.append("dateTo", to.toISOString());
      params.append("page", "1");
      params.append("limit", "1000");

      const res = await fetch(`/api/mail-in?${params.toString()}`);
      if (!res.ok) throw new Error("Erreur réseau");
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Erreur API");

      setMails(Array.isArray(data.data?.data) ? data.data.data : []);
    } catch (err: any) {
      setError(err.message || "Erreur inattendue");
      setMails([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  // Refetch when dialog opens or selectedDate changes
  useEffect(() => {
    if (open) fetchMails();
    // eslint-disable-next-line
  }, [open, selectedDate]);

  const handlePrintSection = () => {
    const content = document.getElementById(
      "printable-mails-dialog"
    )?.innerHTML;
    if (!content) return;
    const printStyles = `
      <style>
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          color: #222;
          margin: 2rem;
          background: #fff;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
        }
        th, td {
          border: 1px solid #555;
          padding: 4px 8px;
          text-align: left;
          vertical-align: top;
        }
        th {
          background: #efefef;
          font-weight: 600;
          font-size: 10px;
        }
        tr:nth-child(even) td {
          background: #f9f9f9;
        }
        caption {
          caption-side: top;
          font-size: 1.2em;
          margin-bottom: 1rem;
          font-weight: bold;
        }
        ul {
          margin: 0;
          padding-left: 12px;
          font-size: 10px;
        }
        li {
          margin-bottom: 2px;
        }
        @media print {
          body { background: #fff !important; }
          table { page-break-inside: avoid; }
        }
      </style>
    `;
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(
        `<html><head><title>Impression des mails</title>${printStyles}</head><body>${content}</body></html>`
      );
      win.document.close();
      win.print();
    }
  };

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <IconPrinter />
        <span>Imprimer</span>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-6xl">
          <DialogHeader>
            <DialogTitle>Impression des mails</DialogTitle>
          </DialogHeader>
          <div className="mb-2 flex items-center gap-4">
            <span>Date :</span>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className="pl-3 text-left font-normal"
                  aria-label="Choisir une date"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate
                    ? format(selectedDate, "PPP", { locale: fr })
                    : "Sélectionnez une date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto p-0">
                <Calendar
                  mode="single"
                  locale={fr}
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date ?? new Date());
                    setCalendarOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div
            id="printable-mails-dialog"
            className="max-h-[70vh] overflow-auto border rounded text-black bg-white"
          >
            <table>
              <caption>
                Courriers du{" "}
                {selectedDate
                  ? format(selectedDate, "dd MMM yyyy", { locale: fr })
                  : ""}
              </caption>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>ID</th>
                  <th>Objet</th>
                  {/* <th>Statut</th> */}
                  <th>INFO</th>
                  <th>SUIVI</th>
                  <th>Copies élus</th>
                  <th>Expéditeurs</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-2">
                      Chargement…
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={8} className="text-red-500 py-2">
                      {error}
                    </td>
                  </tr>
                ) : mails.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-2">
                      Aucun mail trouvé pour cette date.
                    </td>
                  </tr>
                ) : (
                  mails.map((mail) => (
                    <tr key={mail.id}>
                      <td>
                        {format(new Date(mail.date), "dd MMM yyyy", {
                          locale: fr,
                        })}
                      </td>
                      <td>{mail.id}</td>
                      <td>{mail.subject}</td>
                      {/* <td>
                        {mail.needsMayor && "MAIRE requis "}
                        {mail.needsDgs && "DGS requis "}
                        {!mail.needsMayor && !mail.needsDgs && "Standard"}
                      </td> */}
                      <td>
                        {formatServicesForPrint(
                          getServicesByType(mail.services, "INFO")
                        )}
                      </td>
                      <td>
                        {formatServicesForPrint(
                          getServicesByType(mail.services, "SUIVI")
                        )}
                      </td>
                      <td>
                        {mail.copies && mail.copies.length > 0 ? (
                          <ul style={{ margin: 0, paddingLeft: 16 }}>
                            {mail.copies.map((c, i) => (
                              <li key={i}>
                                {c.council
                                  ? `${c.council.firstName || ""} ${
                                      c.council.lastName || ""
                                    }`.trim()
                                  : "—"}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          "Aucune copie"
                        )}
                      </td>
                      <td>
                        {mail.recipients && mail.recipients.length > 0 ? (
                          <ul style={{ margin: 0, paddingLeft: 16 }}>
                            {mail.recipients.map((r, i) => (
                              <li key={i}>
                                {r.contact ? r.contact.name : "—"}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          "Aucun destinataire"
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handlePrintSection}
              disabled={loading || mails.length === 0}
            >
              <IconPrinter />
              &nbsp;Imprimer la sélection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
