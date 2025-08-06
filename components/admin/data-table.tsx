"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, Edit, Trash2, Plus } from "lucide-react";
import Link from "next/link";

interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  title: string;
  description?: string;
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onAdd?: () => void;
  searchKey?: keyof T;
  loading?: boolean;
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  title,
  description,
  onView,
  onEdit,
  onDelete,
  onAdd,
  searchKey,
  loading,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");

  const filteredData = searchKey
    ? data.filter((item) =>
        String(item[searchKey]).toLowerCase().includes(search.toLowerCase())
      )
    : data;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {onAdd && (
          <Button onClick={onAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {searchKey && (
          <div className="mb-4">
            <Input
              placeholder={`Rechercher...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">Chargement...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={String(column.key)}>{column.label}</TableHead>
                ))}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={String(item.id)}>
                  {columns.map((column) => (
                    <TableCell key={String(column.key)}>
                      {column.render ? (
                        column.render(item[column.key], item)
                      ) : column.key === "email" ? (
                        String(item[column.key]) !== "null" ? (
                          <Link href={`mailto:${String(item[column.key])}`}>
                            {String(item[column.key])}
                          </Link>
                        ) : (
                          "Aucun email"
                        )
                      ) : (
                        String(item[column.key])
                      )}
                    </TableCell>
                  ))}
                  <TableCell>
                    <div className="flex gap-2">
                      {onView && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onView(item)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(item)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
