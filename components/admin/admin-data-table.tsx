"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { UserDrawer } from "./UserDrawer";
import {
  IconTrash,
  IconEdit,
  IconEye,
  IconPlus,
  IconUsers,
  IconBuilding,
  IconMail,
  IconSend,
} from "@tabler/icons-react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

interface AdminDataTableProps {
  activeSection: string;
  stats: any;
}

export function AdminDataTable({ activeSection, stats }: AdminDataTableProps) {
  const { data: session } = useSession();

  // États principaux
  const [data, setData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // 🔥 ÉTATS POUR LE DRAWER UTILISATEUR
  const [userDrawer, setUserDrawer] = React.useState<{
    open: boolean;
    user: any | null;
    mode: "view" | "edit" | "create";
  }>({
    open: false,
    user: null,
    mode: "view",
  });

  // 🔥 SERVICES POUR LE DRAWER
  const [services, setServices] = React.useState<any[]>([]);

  // Charger les services pour les utilisateurs
  React.useEffect(() => {
    const loadServices = async () => {
      if (activeSection !== "users") return;

      try {
        const response = await fetch("/api/services");
        const result = await response.json();
        if (result.success) {
          setServices(result.data?.data || result.data || []);
        }
      } catch (error) {
        console.error("Erreur chargement services:", error);
      }
    };

    loadServices();
  }, [activeSection]);

  const getSectionEndpoint = React.useCallback((section: string) => {
    const endpoints: Record<string, string> = {
      users: "/api/users",
      services: "/api/services",
      "mail-in": "/api/mail-in",
      "mail-out": "/api/mail-out",
      "contacts-in": "/api/contacts-in",
      "contacts-out": "/api/contacts-out",
      council: "/api/council",
    };
    return endpoints[section];
  }, []);

  // Chargement des données
  React.useEffect(() => {
    const loadSectionData = async () => {
      if (!session) {
        setData([]);
        return;
      }

      setLoading(true);
      try {
        const endpoint = getSectionEndpoint(activeSection);
        if (!endpoint) {
          console.warn(`Pas d'endpoint pour la section: ${activeSection}`);
          setData([]);
          return;
        }

        const response = await fetch(endpoint);
        const result = await response.json();

        if (result.success) {
          setData(result.data?.data || result.data || []);
        } else {
          console.error("Erreur API:", result.error);
          setData([]);
        }
      } catch (error) {
        console.error("Erreur chargement données:", error);
        toast.error("Erreur lors du chargement des données");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadSectionData();
  }, [activeSection, session, getSectionEndpoint]);

  // Réinitialiser les états quand on change de section
  React.useEffect(() => {
    setSorting([]);
    setColumnFilters([]);
    setRowSelection({});
  }, [activeSection]);

  // 🔥 HANDLERS POUR LE DRAWER UTILISATEUR
  const handleViewUser = React.useCallback((user: any) => {
    setUserDrawer({ open: true, user, mode: "view" });
  }, []);

  const handleEditUser = React.useCallback((user: any) => {
    setUserDrawer({ open: true, user, mode: "edit" });
  }, []);

  const handleCreateUser = React.useCallback(() => {
    setUserDrawer({ open: true, user: null, mode: "create" });
  }, []);

  const handleUserUpdated = React.useCallback(() => {
    // Recharger les données après mise à jour
    const loadData = async () => {
      const endpoint = getSectionEndpoint(activeSection);
      if (!endpoint) return;

      try {
        const response = await fetch(endpoint);
        const result = await response.json();
        if (result.success) {
          setData(result.data?.data || result.data || []);
        }
      } catch (error) {
        console.error("Erreur rechargement données:", error);
      }
    };

    loadData();
  }, [activeSection, getSectionEndpoint]);

  // 🔥 FONCTIONS GÉNÉRIQUES POUR LES AUTRES SECTIONS
  const handleView = React.useCallback(
    (item: any) => {
      if (activeSection === "users") {
        handleViewUser(item);
      } else {
        toast.info(`Affichage de ${item.id}`);
      }
    },
    [activeSection, handleViewUser]
  );

  const handleEdit = React.useCallback(
    (item: any) => {
      if (activeSection === "users") {
        handleEditUser(item);
      } else {
        toast.info(`Modification de ${item.id}`);
      }
    },
    [activeSection, handleEditUser]
  );

  const handleDelete = React.useCallback((item: any) => {
    toast.error(`Suppression de ${item.id}`);
  }, []);

  const handleCreate = React.useCallback(() => {
    if (activeSection === "users") {
      handleCreateUser();
    } else {
      toast.info(`Création d'un nouvel élément dans ${activeSection}`);
    }
  }, [activeSection, handleCreateUser]);

  // Colonnes définies une seule fois
  const columns = React.useMemo((): ColumnDef<any>[] => {
    const baseColumns: ColumnDef<any>[] = [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Sélectionner tout"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Sélectionner la ligne"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ];

    const sectionColumns: Record<string, ColumnDef<any>[]> = {
      users: [
        {
          accessorKey: "id",
          header: "ID",
          cell: ({ row }) => (
            <span className="font-mono">#{row.original.id}</span>
          ),
        },
        {
          accessorKey: "firstName",
          header: "Prénom",
        },
        {
          accessorKey: "lastName",
          header: "Nom",
        },
        {
          accessorKey: "email",
          header: "Email",
        },
        {
          accessorKey: "service",
          header: "Service",
          cell: ({ row }) => (
            <Badge variant="outline">
              {row.original.service?.name || "Non assigné"}
            </Badge>
          ),
        },
        {
          accessorKey: "isActive",
          header: "Statut",
          cell: ({ row }) => (
            <Badge
              variant={
                row.original.isActive !== false ? "default" : "secondary"
              }
            >
              {row.original.isActive !== false ? "Actif" : "Inactif"}
            </Badge>
          ),
        },
      ],
      services: [
        {
          accessorKey: "id",
          header: "ID",
          cell: ({ row }) => (
            <span className="font-mono">#{row.original.id}</span>
          ),
        },
        {
          accessorKey: "name",
          header: "Nom du service",
        },
        {
          accessorKey: "code",
          header: "Code",
          cell: ({ row }) => (
            <Badge variant="secondary">{row.original.code}</Badge>
          ),
        },
        {
          accessorKey: "createdAt",
          header: "Créé le",
          cell: ({ row }) => (
            <span>
              {new Date(row.original.createdAt).toLocaleDateString("fr-FR")}
            </span>
          ),
        },
      ],
      "mail-in": [
        {
          accessorKey: "id",
          header: "ID",
          cell: ({ row }) => (
            <span className="font-mono">#{row.original.id}</span>
          ),
        },
        {
          accessorKey: "subject",
          header: "Objet",
          cell: ({ row }) => (
            <div className="max-w-xs truncate">{row.original.subject}</div>
          ),
        },
        {
          accessorKey: "date",
          header: "Date",
          cell: ({ row }) => (
            <span>
              {new Date(
                row.original.date || row.original.createdAt
              ).toLocaleDateString("fr-FR")}
            </span>
          ),
        },
        {
          accessorKey: "needsMayor",
          header: "Maire",
          cell: ({ row }) =>
            row.original.needsMayor ? (
              <Badge variant="destructive">Requis</Badge>
            ) : null,
        },
        {
          accessorKey: "needsDgs",
          header: "DGS",
          cell: ({ row }) =>
            row.original.needsDgs ? (
              <Badge variant="secondary">Requis</Badge>
            ) : null,
        },
      ],
      "mail-out": [
        {
          accessorKey: "id",
          header: "ID",
          cell: ({ row }) => (
            <span className="font-mono">#{row.original.id}</span>
          ),
        },
        {
          accessorKey: "reference",
          header: "Référence",
          cell: ({ row }) => (
            <Badge variant="outline">{row.original.reference}</Badge>
          ),
        },
        {
          accessorKey: "subject",
          header: "Objet",
          cell: ({ row }) => (
            <div className="max-w-xs truncate">{row.original.subject}</div>
          ),
        },
        {
          accessorKey: "date",
          header: "Date",
          cell: ({ row }) => (
            <span>
              {new Date(
                row.original.date || row.original.createdAt
              ).toLocaleDateString("fr-FR")}
            </span>
          ),
        },
        {
          accessorKey: "service",
          header: "Service",
          cell: ({ row }) => (
            <Badge variant="secondary">
              {row.original.service?.code || "N/A"}
            </Badge>
          ),
        },
      ],
      "contacts-in": [
        {
          accessorKey: "id",
          header: "ID",
          cell: ({ row }) => (
            <span className="font-mono">#{row.original.id}</span>
          ),
        },
        {
          accessorKey: "name",
          header: "Nom",
        },
        {
          accessorKey: "email",
          header: "Email",
        },
        {
          accessorKey: "createdAt",
          header: "Créé le",
          cell: ({ row }) => (
            <span>
              {new Date(row.original.createdAt).toLocaleDateString("fr-FR")}
            </span>
          ),
        },
      ],
      "contacts-out": [
        {
          accessorKey: "id",
          header: "ID",
          cell: ({ row }) => (
            <span className="font-mono">#{row.original.id}</span>
          ),
        },
        {
          accessorKey: "name",
          header: "Nom",
        },
        {
          accessorKey: "email",
          header: "Email",
        },
        {
          accessorKey: "createdAt",
          header: "Créé le",
          cell: ({ row }) => (
            <span>
              {new Date(row.original.createdAt).toLocaleDateString("fr-FR")}
            </span>
          ),
        },
      ],
      council: [
        {
          accessorKey: "id",
          header: "ID",
          cell: ({ row }) => (
            <span className="font-mono">#{row.original.id}</span>
          ),
        },
        {
          accessorKey: "name",
          header: "Nom",
        },
        {
          accessorKey: "role",
          header: "Rôle",
          cell: ({ row }) => (
            <Badge variant="outline">{row.original.role || "Conseiller"}</Badge>
          ),
        },
        {
          accessorKey: "createdAt",
          header: "Créé le",
          cell: ({ row }) => (
            <span>
              {new Date(row.original.createdAt).toLocaleDateString("fr-FR")}
            </span>
          ),
        },
      ],
    };

    const actionColumn: ColumnDef<any> = {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Ouvrir le menu</span>
              <IconEdit className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleView(row.original)}>
              <IconEye className="mr-2 h-4 w-4" />
              Voir
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEdit(row.original)}>
              <IconEdit className="mr-2 h-4 w-4" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDelete(row.original)}
              className="text-red-600"
            >
              <IconTrash className="mr-2 h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    };

    return [
      ...baseColumns,
      ...(sectionColumns[activeSection] || []),
      actionColumn,
    ];
  }, [activeSection, handleView, handleEdit, handleDelete]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const getSectionTitle = () => {
    const titles: Record<string, string> = {
      users: "Gestion des utilisateurs",
      services: "Gestion des services",
      "mail-in": "Courriers entrants",
      "mail-out": "Courriers sortants",
      "contacts-in": "Contacts entrants",
      "contacts-out": "Contacts sortants",
      council: "Conseillers municipaux",
    };
    return titles[activeSection] || "Administration";
  };

  const getSectionIcon = () => {
    const icons: Record<string, React.ReactNode> = {
      users: <IconUsers className="h-5 w-5" />,
      services: <IconBuilding className="h-5 w-5" />,
      "mail-in": <IconMail className="h-5 w-5" />,
      "mail-out": <IconSend className="h-5 w-5" />,
      "contacts-in": <IconUsers className="h-5 w-5" />,
      "contacts-out": <IconUsers className="h-5 w-5" />,
      council: <IconUsers className="h-5 w-5" />,
    };
    return icons[activeSection];
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getSectionIcon()}
              <CardTitle>{getSectionTitle()}</CardTitle>
            </div>
            <Button onClick={handleCreate}>
              <IconPlus className="mr-2 h-4 w-4" />
              Créer
            </Button>
          </div>
          <CardDescription>
            Gestion complète des {activeSection}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center py-4">
            <Input
              placeholder="Rechercher..."
              value={
                (table.getColumn("firstName")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("firstName")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      Aucun résultat trouvé pour cette section.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} sur{" "}
              {table.getFilteredRowModel().rows.length} ligne(s)
              sélectionnée(s).
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Suivant
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 🔥 DRAWER UTILISATEUR */}
      {activeSection === "users" && (
        <UserDrawer
          open={userDrawer.open}
          onOpenChange={(open) => setUserDrawer((prev) => ({ ...prev, open }))}
          user={userDrawer.user}
          mode={userDrawer.mode}
          services={services}
          onUserUpdated={handleUserUpdated}
        />
      )}
    </>
  );
}
