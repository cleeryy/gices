"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface HistoryPaginationProps {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (limit: number) => void;
}

export function HistoryPagination({
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
}: HistoryPaginationProps) {
  // ✅ CORRECTION: Plus d'états internes, tout vient des props
  const totalPages = totalItems > 0 ? Math.ceil(totalItems / itemsPerPage) : 1;

  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handleItemsPerPageChange = (value: string) => {
    onItemsPerPageChange(Number(value));
  };

  // Si pas de résultats, on n'affiche rien ou un message simple
  if (totalItems === 0) {
    return (
      <div className="flex items-center justify-center text-sm text-muted-foreground">
        Aucun résultat à paginer.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Afficher</span>
        <Select
          value={itemsPerPage.toString()}
          onValueChange={handleItemsPerPageChange}
        >
          <SelectTrigger className="w-[70px] h-8 bg-background border-input">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[10, 20, 50, 100].map((val) => (
              <SelectItem key={val} value={val.toString()}>
                {val}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span>par page</span>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>
          {startItem}-{endItem} sur {totalItems}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="h-8 w-8 p-0"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground px-2">
          Page {currentPage} sur {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="h-8 w-8 p-0"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
