"use client";

import { useState, useCallback } from "react";
import { HistoryHeader } from "./components/history-header";
import { HistoryFilters } from "./components/history-filters";
import { HistoryTable } from "./components/history-table";
import { HistoryPagination } from "./components/history-pagination";
import { Card } from "@/components/ui/card";

export default function HistoriquePage() {
  const [filters, setFilters] = useState<{
    searchQuery: string;
    needsMayor?: boolean;
    needsDgs?: boolean;
    serviceIds?: number[];
    dateFrom?: Date;
    dateTo?: Date;
  }>({ searchQuery: "" });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const handleFiltersChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  return (
    <div className="container px-4 mx-auto py-6 space-y-6">
      <HistoryHeader />

      <Card className="border-border bg-card">
        <div className="p-6 space-y-6">
          <HistoryFilters onFiltersChange={handleFiltersChange} />

          <HistoryTable
            searchQuery={filters.searchQuery}
            filters={{
              needsMayor: filters.needsMayor,
              needsDgs: filters.needsDgs,
              serviceIds: filters.serviceIds,
              dateFrom: filters.dateFrom,
              dateTo: filters.dateTo,
            }}
            page={currentPage}
            limit={itemsPerPage}
            onDataLoaded={(total) => setTotalItems(total)}
          />

          <HistoryPagination
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(limit) => {
              setItemsPerPage(limit);
              setCurrentPage(1);
            }}
          />
        </div>
      </Card>
    </div>
  );
}
