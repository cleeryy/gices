"use client";

import * as React from "react";
import { CalendarPlusIcon } from "lucide-react";

import { fr } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";

export default function Calendar32() {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  return (
    <div className="flex flex-col items-center gap-3">
      <Label htmlFor="date" className="px-1">
        Date du courrier
      </Label>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className="w-48 justify-between font-normal"
          >
            {date ? date.toLocaleDateString("fr") : "Select date"}
            <CalendarPlusIcon />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="w-auto overflow-hidden p-0">
          <DrawerHeader className="sr-only">
            <DrawerTitle>Choisissez une date</DrawerTitle>
            <DrawerDescription>
              Selectionnez la date du courrier
            </DrawerDescription>
          </DrawerHeader>
          <Calendar
            locale={fr}
            mode="single"
            selected={date}
            captionLayout="label"
            onSelect={(date) => {
              setDate(date);
              setOpen(false);
            }}
            className="mx-auto [--cell-size:clamp(0px,calc(100vw/7.5),52px)]"
          />
        </DrawerContent>
      </Drawer>
    </div>
  );
}
