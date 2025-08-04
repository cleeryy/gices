"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Edit, X, Save, Loader2, AlertCircle } from "lucide-react";
import { ViewMailDialog } from "@/components/types/dashboard";

interface MailViewDialogProps {
  viewDialog: ViewMailDialog;
  formatDate: (dateString: string) => string;
  onClose: () => void;
  onUpdate: () => void;
}

export function MailViewDialog({
  viewDialog,
  formatDate,
  onClose,
  onUpdate,
}: MailViewDialogProps) {
  const [editMode, setEditMode] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const editForm = useForm();

  // Pré-remplir le formulaire lors du changement de mail
  useEffect(() => {
    if (viewDialog.mail) {
      editForm.reset({
        subject: viewDialog.mail.subject,
        date: viewDialog.mail.date
          ? viewDialog.mail.date.split("T")[0]
          : new Date().toISOString().split("T")[0],
        ...(viewDialog.type === "in"
          ? {
              needsMayor: viewDialog.mail.needsMayor,
              needsDgs: viewDialog.mail.needsDgs,
            }
          : {
              reference: viewDialog.mail.reference,
            }),
      });
    }
  }, [viewDialog.mail, editForm]);

  const handleEditSubmit = async (data: any) => {
    setEditSubmitting(true);
    setSubmitError(null);

    try {
      const { mail, type } = viewDialog;
      const endpoint =
        type === "in" ? `/api/mail-in/${mail.id}` : `/api/mail-out/${mail.id}`;

      const payload = {
        subject: data.subject,
        date: new Date(data.date),
        ...(type === "in"
          ? {
              needsMayor: data.needsMayor || false,
              needsDgs: data.needsDgs || false,
            }
          : {
              reference: data.reference,
            }),
      };

      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!result.success) {
        throw new Error(result.error || "Erreur lors de la modification");
      }

      setEditMode(false);
      onUpdate();
      onClose();
    } catch (err: any) {
      setSubmitError(err.message || "Erreur serveur");
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleClose = () => {
    setEditMode(false);
    setSubmitError(null);
    editForm.reset();
    onClose();
  };

  return (
    <Dialog open={viewDialog.open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>
                {viewDialog.type === "in"
                  ? "Courrier Entrant"
                  : "Courrier Sortant"}
                {editMode && " - Mode Édition"}
              </DialogTitle>
              <DialogDescription>
                {editMode
                  ? "Modifiez les informations du courrier"
                  : "Consultez les détails du courrier"}
              </DialogDescription>
            </div>
            <div className="flex items-center space-x-2">
              {!editMode ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditMode(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditMode(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        {viewDialog.mail && (
          <div className="space-y-4">
            {!editMode ? (
              // Mode consultation
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">ID</Label>
                    <p className="text-sm bg-muted/50 p-2 rounded border">
                      #{viewDialog.mail.id}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Date</Label>
                    <p className="text-sm bg-muted/50 p-2 rounded border">
                      {formatDate(
                        viewDialog.mail.date || viewDialog.mail.createdAt
                      )}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Objet</Label>
                  <p className="text-sm bg-muted/50 p-3 rounded border">
                    {viewDialog.mail.subject}
                  </p>
                </div>

                {viewDialog.type === "in" ? (
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <CheckCircle
                          className={`h-4 w-4 ${
                            viewDialog.mail.needsMayor
                              ? "text-destructive"
                              : "text-muted-foreground"
                          }`}
                        />
                        <span
                          className={`text-sm ${
                            viewDialog.mail.needsMayor
                              ? "text-destructive"
                              : "text-muted-foreground"
                          }`}
                        >
                          Nécessite le maire
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle
                          className={`h-4 w-4 ${
                            viewDialog.mail.needsDgs
                              ? "text-secondary"
                              : "text-muted-foreground"
                          }`}
                        />
                        <span
                          className={`text-sm ${
                            viewDialog.mail.needsDgs
                              ? "text-secondary"
                              : "text-muted-foreground"
                          }`}
                        >
                          Nécessite le DGS
                        </span>
                      </div>
                    </div>

                    {viewDialog.mail.services &&
                      viewDialog.mail.services.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Services concernés
                          </Label>
                          <div className="flex flex-wrap gap-2">
                            {viewDialog.mail.services.map((serviceRel: any) => (
                              <Badge
                                key={serviceRel.service.id}
                                variant="outline"
                              >
                                {serviceRel.service.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Référence</Label>
                      <p className="text-sm bg-muted/50 p-2 rounded border">
                        {viewDialog.mail.reference}
                      </p>
                    </div>

                    {viewDialog.mail.service && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Service expéditeur
                        </Label>
                        <Badge variant="outline">
                          {viewDialog.mail.service.name} (
                          {viewDialog.mail.service.code})
                        </Badge>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              // Mode édition
              <form
                onSubmit={editForm.handleSubmit(handleEditSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-date">Date</Label>
                    <Input
                      id="edit-date"
                      type="date"
                      {...editForm.register("date", { required: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-subject">Objet</Label>
                    <Input
                      id="edit-subject"
                      {...editForm.register("subject", { required: true })}
                    />
                  </div>
                </div>

                {viewDialog.type === "in" ? (
                  <div className="space-y-3">
                    <Label>Options spéciales</Label>
                    <div className="flex gap-6">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="edit-needsMayor"
                          checked={editForm.watch("needsMayor")}
                          onCheckedChange={(checked) =>
                            editForm.setValue("needsMayor", !!checked)
                          }
                        />
                        <Label htmlFor="edit-needsMayor">
                          Nécessite le maire
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="edit-needsDgs"
                          checked={editForm.watch("needsDgs")}
                          onCheckedChange={(checked) =>
                            editForm.setValue("needsDgs", !!checked)
                          }
                        />
                        <Label htmlFor="edit-needsDgs">Nécessite le DGS</Label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="edit-reference">Référence</Label>
                    <Input
                      id="edit-reference"
                      {...editForm.register("reference", { required: true })}
                    />
                  </div>
                )}

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
                    onClick={() => setEditMode(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={editSubmitting}>
                    {editSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Modification...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Sauvegarder
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
