"use client";

import { useState, useEffect, useMemo } from "react";
import debounce from "lodash/debounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Check, ChevronsUpDown, X } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { DateRange } from "react-day-picker";

interface Service {
  id: number;
  name: string;
  code: string;
}

interface ContactIn {
  id: number;
  name: string;
}

interface HistoryFiltersProps {
  onFiltersChange: (filters: {
    searchQuery: string;
    needsMayor?: boolean;
    needsDgs?: boolean;
    serviceIds?: number[];
    contactIds?: number[];
    dateFrom?: Date;
    dateTo?: Date;
  }) => void;
}

function getStartOfDayUTC(d?: Date) {
  if (!d) return undefined;
  return new Date(
    Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
  );
}

function getEndOfDayUTC(d?: Date) {
  if (!d) return undefined;
  return new Date(
    Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)
  );
}

export function HistoryFilters({ onFiltersChange }: HistoryFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [needsMayor, setNeedsMayor] = useState<boolean | undefined>(undefined);
  const [needsDgs, setNeedsDgs] = useState<boolean | undefined>(undefined);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<ContactIn[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [searchedContacts, setSearchedContacts] = useState<ContactIn[]>([]); // Only searched contacts
  const [contactSearchQuery, setContactSearchQuery] = useState("");
  const [servicesLoading, setServicesLoading] = useState(true);
  const [contactsSearching, setContactsSearching] = useState(false); // Changed to searching state

  const debouncedSetSearchQuery = useMemo(
    () =>
      debounce((value: string) => {
        setSearchQuery(value);
      }, 700),
    []
  );

  // Debounced contact search with 3 character minimum - fetches from server
  const debouncedContactSearch = useMemo(
    () =>
      debounce(async (value: string) => {
        if (value.length >= 3) {
          setContactsSearching(true);
          try {
            const response = await fetch(
              `/api/contacts-in?query=${encodeURIComponent(value)}&limit=50`
            );
            const contactsRes = await response.json();
            if (contactsRes.success) {
              const contactsData =
                contactsRes.data?.data || contactsRes.data || [];
              setSearchedContacts(contactsData);
            } else {
              setSearchedContacts([]);
            }
          } catch (error) {
            console.error("Erreur lors de la recherche des contacts:", error);
            setSearchedContacts([]);
          } finally {
            setContactsSearching(false);
          }
        } else {
          setSearchedContacts([]);
        }
      }, 400),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSetSearchQuery.cancel();
      debouncedContactSearch.cancel();
    };
  }, [debouncedSetSearchQuery, debouncedContactSearch]);

  // Handle contact search input change
  useEffect(() => {
    debouncedContactSearch(contactSearchQuery);
  }, [contactSearchQuery, debouncedContactSearch]);

  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      setServicesLoading(true);
      try {
        const response = await fetch("/api/services");
        const servicesRes = await response.json();
        if (servicesRes.success) {
          const servicesData = servicesRes.data?.data || servicesRes.data || [];
          setAllServices(
            servicesData.sort((a: Service, b: Service) =>
              a.name.localeCompare(b.name)
            )
          );
        }
      } catch (error) {
        console.error("Erreur lors du chargement des services:", error);
      } finally {
        setServicesLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Update filters when any dependency changes
  useEffect(() => {
    if (typeof onFiltersChange === "function") {
      onFiltersChange({
        searchQuery,
        needsMayor,
        needsDgs,
        serviceIds: selectedServices.map((s) => s.id),
        contactIds: selectedContacts.map((c) => c.id),
        dateFrom: getStartOfDayUTC(dateRange?.from),
        dateTo: getEndOfDayUTC(dateRange?.to),
      });
    }
  }, [
    searchQuery,
    needsMayor,
    needsDgs,
    selectedServices,
    selectedContacts,
    dateRange,
    onFiltersChange,
  ]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSetSearchQuery(e.target.value);
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedServices((prev) =>
      prev.some((s) => s.id === service.id)
        ? prev.filter((s) => s.id !== service.id)
        : [...prev, service]
    );
  };

  const handleContactSelect = (contact: ContactIn) => {
    setSelectedContacts((prev) =>
      prev.some((c) => c.id === contact.id)
        ? prev.filter((c) => c.id !== contact.id)
        : [...prev, contact]
    );
  };

  const hasActiveFilters =
    searchQuery ||
    needsMayor !== undefined ||
    needsDgs !== undefined ||
    selectedServices.length > 0 ||
    selectedContacts.length > 0 ||
    dateRange?.from;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="flex-1">
          <Input
            placeholder="Rechercher par objet..."
            defaultValue={searchQuery}
            onChange={handleSearchChange}
            className="bg-background border-input"
          />
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* Services selector */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full sm:w-[240px] justify-between"
                disabled={servicesLoading}
              >
                <span className="truncate">
                  {selectedServices.length > 0
                    ? `${selectedServices.length} service(s) sélectionné(s)`
                    : servicesLoading
                    ? "Chargement..."
                    : "Sélectionner services..."}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[240px] p-0">
              <Command>
                <CommandInput placeholder="Chercher un service..." />
                <CommandList>
                  <CommandEmpty>Aucun service trouvé.</CommandEmpty>
                  <CommandGroup>
                    {allServices.map((service) => (
                      <CommandItem
                        key={service.id}
                        value={`${service.name} ${service.code}`}
                        onSelect={() => handleServiceSelect(service)}
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${
                            selectedServices.some((s) => s.id === service.id)
                              ? "opacity-100"
                              : "opacity-0"
                          }`}
                        />
                        {service.code} - {service.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Expediteurs (Contacts In) selector */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full sm:w-[240px] justify-between"
              >
                <span className="truncate">
                  {selectedContacts.length > 0
                    ? `${selectedContacts.length} expéditeur(s) sélectionné(s)`
                    : "Sélectionner expéditeurs..."}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[240px] p-0">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Chercher un expéditeur (min. 3 car.)..."
                  value={contactSearchQuery}
                  onValueChange={setContactSearchQuery}
                />
                <CommandList>
                  <CommandEmpty>
                    {contactsSearching
                      ? "Recherche en cours..."
                      : contactSearchQuery.length > 0 &&
                        contactSearchQuery.length < 3
                      ? "Tapez au moins 3 caractères pour rechercher..."
                      : contactSearchQuery.length >= 3
                      ? "Aucun expéditeur trouvé."
                      : "Tapez au moins 3 caractères pour commencer la recherche..."}
                  </CommandEmpty>
                  <CommandGroup>
                    {searchedContacts.map((contact) => (
                      <CommandItem
                        key={contact.id}
                        value={contact.name}
                        onSelect={() => handleContactSelect(contact)}
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${
                            selectedContacts.some((c) => c.id === contact.id)
                              ? "opacity-100"
                              : "opacity-0"
                          }`}
                        />
                        {contact.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Date range selector */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full sm:w-[220px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from
                  ? dateRange.to
                    ? `${format(dateRange.from, "dd/MM/yy")} - ${format(
                        dateRange.to,
                        "dd/MM/yy"
                      )}`
                    : format(dateRange.from, "dd/MM/yyyy")
                  : "Sélectionner une période"}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 bg-popover border-border"
              align="start"
            >
              <Calendar
                initialFocus
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                locale={fr}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Boolean filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 border rounded-lg bg-muted/50 border-border">
        <div className="flex items-center space-x-2">
          <Switch
            id="needsMayor"
            checked={needsMayor === true}
            onCheckedChange={(checked) =>
              setNeedsMayor(checked ? true : undefined)
            }
          />
          <Label htmlFor="needsMayor">MAIRE requis</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="needsDgs"
            checked={needsDgs === true}
            onCheckedChange={(checked) =>
              setNeedsDgs(checked ? true : undefined)
            }
          />
          <Label htmlFor="needsDgs">DGS requis</Label>
        </div>
      </div>

      {/* Active filters badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          {selectedServices.map((service) => (
            <Badge key={service.id} variant="secondary">
              {service.code}
              <button
                onClick={() => handleServiceSelect(service)}
                className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </Badge>
          ))}
          {selectedContacts.map((contact) => (
            <Badge key={contact.id} variant="secondary">
              {contact.name}
              <button
                onClick={() => handleContactSelect(contact)}
                className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
