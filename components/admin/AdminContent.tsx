"use client";

import { AdminOverview } from "./AdminOverview";
import { AdminDataTable } from "./admin-data-table";

interface AdminContentProps {
  activeSection: string;
  stats: any;
  onSectionChange?: (section: string) => void;
}

export function AdminContent({
  activeSection,
  stats,
  onSectionChange,
}: AdminContentProps) {
  // 🔥 CONDITION AVANT TOUS LES HOOKS
  if (activeSection === "overview") {
    return (
      <AdminOverview
        stats={stats}
        onSectionChange={onSectionChange || (() => {})}
      />
    );
  }

  // 🔥 SI CE N'EST PAS OVERVIEW, AFFICHER LE TABLEAU
  return <AdminDataTable activeSection={activeSection} stats={stats} />;
}
