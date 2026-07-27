"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarIcon } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function formatDate(date: Date | undefined) {
  if (!date) return "";
  return date.toLocaleDateString("pt-BR");
}

// Dropdown de calendário em React puro (SEM Base UI Popover/Dialog) —
// idêntico ao que passou a ser usado no formulário real de Atletas.
function CalendarioDropdown() {
  const [aberto, setAberto] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date("2025-06-01"));
  const [value, setValue] = useState(formatDate(date));
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    function aoApontar(e: PointerEvent) {
      if (wrapRef.current?.contains(e.target as Node)) return;
      setAberto(false);
    }
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === "Escape") setAberto(false);
    }
    document.addEventListener("pointerdown", aoApontar);
    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("pointerdown", aoApontar);
      document.removeEventListener("keydown", aoTeclar);
    };
  }, [aberto]);

  return (
    <InputGroup>
      <InputGroupInput
        value={value}
        placeholder="dd/mm/aaaa"
        onChange={(e) => setValue(e.target.value)}
      />
      <InputGroupAddon align="inline-end">
        <div ref={wrapRef} className="relative">
          <InputGroupButton
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Abrir calendário"
            aria-expanded={aberto}
            onClick={() => setAberto((v) => !v)}
          >
            <CalendarIcon className="size-4" aria-hidden="true" />
          </InputGroupButton>
          {aberto && (
            <div
              role="dialog"
              aria-label="Selecionar data"
              className="absolute right-0 top-[calc(100%+0.5rem)] z-50 rounded-lg bg-popover p-2 shadow-md ring-1 ring-foreground/10"
            >
              <Calendar
                mode="single"
                selected={date}
                captionLayout="dropdown"
                onSelect={(d) => {
                  if (!d) return;
                  setDate(d);
                  setValue(formatDate(d));
                  setAberto(false);
                }}
              />
            </div>
          )}
        </div>
      </InputGroupAddon>
    </InputGroup>
  );
}

// Teste 1: dropdown React puro, SEM Dialog pai.
function Teste1SemDialogPai() {
  return (
    <Field className="mx-auto w-56">
      <FieldLabel>Teste 1 — React puro, sem Dialog pai</FieldLabel>
      <CalendarioDropdown />
    </Field>
  );
}

// Teste 2: dropdown React puro DENTRO de um Dialog pai (Base UI) — reproduz
// exatamente a estrutura do formulário "Editar atleta".
function Teste2ComDialogPai() {
  const [openDialog, setOpenDialog] = useState(false);
  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger
        render={
          <button type="button" className="cursor-pointer rounded-lg border px-3 py-1.5">
            Teste 2 — abrir Dialog pai (como &quot;Editar atleta&quot;)
          </button>
        }
      />
      {openDialog && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog pai (Base UI)</DialogTitle>
          </DialogHeader>
          <Field className="w-56">
            <FieldLabel>Data (React puro, dentro de Dialog)</FieldLabel>
            <CalendarioDropdown />
          </Field>
        </DialogContent>
      )}
    </Dialog>
  );
}

export default function DebugDatePickerPage() {
  return (
    <div className="flex flex-col gap-12 p-8">
      <h1 className="text-xl font-bold">
        Debug: date picker React puro (página temporária de teste)
      </h1>
      <Teste1SemDialogPai />
      <Teste2ComDialogPai />
    </div>
  );
}
