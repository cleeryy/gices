"use client";

import { Button } from "@/components/ui/button";
import { CreateMailInDialog } from "./dialogs/CreateMailInDialog";
import { CreateMailOutDialog } from "./dialogs/CreateMailOutDialog";
import { Mail, Send, Users, FileText } from "lucide-react";
import { ServiceData, ContactData } from "@/components/types/dashboard";

interface QuickActionsProps {
  services: ServiceData[];
  contactsIn: ContactData[];
  contactsOut: ContactData[];
  council: any[];
  onProfileClick?: () => void;
  onAdvancedManagementClick?: () => void;
  onMailCreated?: () => void;
}

export function QuickActions({
  services,
  contactsIn,
  contactsOut,
  council,
  onProfileClick,
  onAdvancedManagementClick,
  onMailCreated,
}: QuickActionsProps) {
  return (
    <div className="grid grid-flow-col gap-6 mb-8">
      <CreateMailInDialog
        services={services}
        contactsIn={contactsIn}
        council={council}
        onSuccess={onMailCreated}
        trigger={
          <Button className="col-span-2 h-20 flex flex-col space-y-2 bg-primary hover:bg-primary/90">
            <Mail className="h-6 w-6" />
            <span className="text-xs">Nouveau Courrier Entrant</span>
          </Button>
        }
      />

      {/* <CreateMailOutDialog
        services={services}
        contactsOut={contactsOut}
        onSuccess={onMailCreated}
        trigger={
          <Button className="h-20 flex flex-col space-y-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground">
            <Send className="h-6 w-6" />
            <span className="text-xs">Nouveau Courrier Sortant</span>
          </Button>
        }
      /> */}

      <Button
        variant="outline"
        className="h-20 flex flex-col space-y-2"
        onClick={onProfileClick}
      >
        <Users className="h-6 w-6" />
        <span className="text-xs">Mon Profil</span>
      </Button>

      <Button
        variant="outline"
        className="h-20 flex flex-col space-y-2"
        onClick={onAdvancedManagementClick}
        // disabled
      >
        <FileText className="h-6 w-6" />
        <span className="text-xs">Historique</span>
      </Button>
    </div>
  );
}
