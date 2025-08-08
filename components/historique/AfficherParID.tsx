"use client";
import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import {
  IconId,
  IconMail,
  IconCalendar,
  IconUser,
  IconBuilding,
  IconUsers,
  IconSearch,
  IconLoader2,
} from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Alert, AlertDescription } from "../ui/alert";

export interface MailIn {
  id: number;
  date: string;
  subject: string;
  needsMayor: boolean;
  needsDgs: boolean;
  services: {
    serviceId: number;
    mailInId: number;
    createdAt: string;
    type: "INFO" | "SUIVI";
    service: {
      id: number;
      name: string;
      code: string;
    };
  }[];
  copies: {
    council: {
      id: number;
      firstName: string;
      lastName: string;
      position: string;
    };
  }[];
  recipients: {
    contact: {
      id: number;
      name: string;
    };
  }[];
  userReceivedMails: {
    user: {
      id: string;
      firstName: string;
      lastName: string;
    };
  }[];
}

function AfficherParID() {
  const [open, setOpen] = useState(false);
  const [mailId, setMailId] = useState<string | number>("");
  const [mailData, setMailData] = useState<MailIn | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchMail() {
      if (!open) return;
      if (!mailId || isNaN(Number(mailId)) || Number(mailId) <= 0) {
        setMailData(null);
        setError("");
        return;
      }
      setIsLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/mail-in/${mailId}`);
        if (!res.ok) {
          throw new Error(
            `Erreur lors de la récupération du mail : ${res.status}`
          );
        }
        const json = await res.json();
        if (!json.success) {
          throw new Error(json.message || "Erreur inconnue");
        }
        setMailData(json.data);
      } catch (err) {
        setMailData(null);
        // @ts-expect-error
        setError(err.message || "Erreur inconnue");
      } finally {
        setIsLoading(false);
      }
    }
    fetchMail();
  }, [mailId, open]);

  return (
    <>
      <div className="flex items-center justify-center gap-2">
        <Input
          type="number"
          placeholder="Entrez un ID..."
          value={mailId}
          onChange={(e) => setMailId(e.target.value)}
          className="bg-muted text-default"
        />
        <Button
          variant="outline"
          onClick={() => setOpen(!open)}
          disabled={!mailId || Number(mailId) <= 0}
          className="bg-secondary text-default"
        >
          <IconId />
          <span>Afficher par ID</span>
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <IconMail className="h-5 w-5" />
              Mail #{mailId}
            </DialogTitle>
          </DialogHeader>

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <IconLoader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-muted-foreground">
                Chargement en cours...
              </span>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {mailData && !isLoading && (
            <div className="space-y-6">
              {/* Informations principales */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IconMail className="h-4 w-4" />
                    Informations générales
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Objet
                    </label>
                    <p className="text-base font-medium mt-1">
                      {mailData.subject}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <IconCalendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {new Date(mailData.date).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  {/* <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        Maire requis :
                      </span>
                      <Badge
                        variant={mailData.needsMayor ? "default" : "secondary"}
                      >
                        {mailData.needsMayor ? "Oui" : "Non"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">DGS requis :</span>
                      <Badge
                        variant={mailData.needsDgs ? "default" : "secondary"}
                      >
                        {mailData.needsDgs ? "Oui" : "Non"}
                      </Badge>
                    </div>
                  </div> */}
                </CardContent>
              </Card>

              {/* Services */}
              {mailData.services?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconBuilding className="h-4 w-4" />
                      Services concernés
                      <Badge variant="outline">
                        {mailData.services.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mailData.services.map(({ service, type }) => (
                        <div
                          key={service.id}
                          className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                        >
                          <div>
                            <p className="font-medium">{service.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Code: {service.code}
                            </p>
                          </div>
                          <Badge
                            variant={type === "INFO" ? "default" : "secondary"}
                          >
                            {type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Conseillers */}
              {mailData.copies?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconUsers className="h-4 w-4" />
                      Conseillers en copie
                      <Badge variant="outline">{mailData.copies.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 md:grid-cols-2">
                      {mailData.copies.map(({ council }) => (
                        <div
                          key={council.id}
                          className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
                        >
                          <IconUser className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {council.firstName} {council.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {council.position}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Contacts */}
              {mailData.recipients?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconUser className="h-4 w-4" />
                      Expéditeur(s)
                      <Badge variant="outline">
                        {mailData.recipients.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2 md:grid-cols-2">
                      {mailData.recipients.map(({ contact }) => (
                        <div
                          key={contact.id}
                          className="flex items-center gap-2 p-2 rounded border bg-muted/20"
                        >
                          <IconUser className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{contact.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {!mailData && !isLoading && !error && mailId && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <IconMail className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Mail introuvable</h3>
              <p className="text-muted-foreground">
                Aucun mail trouvé avec l'ID #{mailId}
              </p>
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AfficherParID;
