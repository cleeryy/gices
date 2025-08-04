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
  if (activeSection === "overview") {
    return (
      <AdminOverview
        stats={stats}
        onSectionChange={onSectionChange || (() => {})}
      />
    );
  }

  return <AdminDataTable activeSection={activeSection} stats={stats} />;
}
