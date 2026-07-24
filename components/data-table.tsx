"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type DataTableFilter = {
  columnId: string;
  label: string;
  placeholder: string;
  options: { value: string; label: string }[];
};

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchPlaceholder?: string;
  filters?: DataTableFilter[];
};

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = "Buscar...",
  filters = [],
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    state: { sorting, globalFilter, columnFilters },
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder={searchPlaceholder}
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
        {filters.map((filter) => {
          const selectId = `filter-${filter.columnId}`;
          return (
            <div key={filter.columnId} className="flex flex-col gap-1">
              <Label htmlFor={selectId} className="sr-only">
                Filtrar por {filter.label}
              </Label>
              <NativeSelect
                id={selectId}
                className="w-auto max-w-48"
                value={
                  (table.getColumn(filter.columnId)?.getFilterValue() as string) ??
                  ""
                }
                onChange={(event) =>
                  table
                    .getColumn(filter.columnId)
                    ?.setFilterValue(event.target.value || undefined)
                }
              >
                <option value="">{filter.placeholder}</option>
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </NativeSelect>
            </div>
          );
        })}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  // Colunas de exibição sem cabeçalho de texto (ex.: a
                  // coluna de ações editar/excluir, header: "") não têm
                  // valor útil para ordenar — mesmo com getCanSort() true
                  // por padrão, não mostramos a affordance de clique nelas.
                  const canSort =
                    !header.isPlaceholder &&
                    header.column.getCanSort() &&
                    header.column.columnDef.header !== "";
                  const sorted = header.column.getIsSorted();

                  return (
                    <TableHead
                      key={header.id}
                      onClick={
                        canSort
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                      className={
                        canSort ? "cursor-pointer select-none" : undefined
                      }
                    >
                      {header.isPlaceholder ? null : (
                        <span className="inline-flex items-center gap-1">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {canSort &&
                            (sorted === "asc" ? (
                              <ChevronUp className="size-3.5" aria-hidden="true" />
                            ) : sorted === "desc" ? (
                              <ChevronDown className="size-3.5" aria-hidden="true" />
                            ) : (
                              <ChevronsUpDown
                                className="size-3.5 text-muted-foreground/50"
                                aria-hidden="true"
                              />
                            ))}
                        </span>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  Nenhum resultado encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
