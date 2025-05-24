import { useMemo, useState } from "react"
import {
  RowData,
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { KeyboardInput, ShowKeyboardKeys } from "@/components/keyboardInput"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  getRegisteredShortcuts,
  setUserShortcut,
  resetUserShortcuts
} from "@/features/keyboard/ks"
import type { KeyboardShortcut, KeyPressConfig } from "@/features/keyboard/types"

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    editing: number
    setEditing: (v: number) => void
    setValue: (v: Nullable<KeyPressConfig>) => void
  }
}

const columns: ColumnDef<KeyboardShortcut>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "shortcut",
    header: "Shortcut",
    cell: ({ row, table: { options: { meta } } }) => {
      return (
        <>
        {meta!.editing == row.index ? (
          <KeyboardInput
            cancelEditing={() => meta!.setEditing(-1)}
            setValue={meta!.setValue}
          />
        ) : (
          <div className="hover:cursor-pointer">
            <ShowKeyboardKeys
              config={row.original.userConfig ?? row.original.defaultConfig}
              onClick={() => meta?.setEditing(row.index)}
            />
          </div>
        )}
        </>
      )
    }
  },
  {
    accessorKey: "where",
    header: "Where",
    cell: ({ row }) => (
      <div className="capitalize">
        {Array.from(row.original.where).sort().join(", ")}
      </div>
    )
  },
  {
    accessorKey: "description",
    header: "Description"
  }
]

export function KeyboardShortcutsTable({data}: {data: KeyboardShortcut[]}) {
  const [tableData, setTableData] = useState(data)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [editingKS, setEditingKS] = useState(-1)

  const handleUserKSEdit = (config: Nullable<KeyPressConfig>) => {
    void setUserShortcut(editingKS, config)
    setTableData(old => {
      old[editingKS].userConfig = config
      return old
    })
    setEditingKS(-1)
  }

  const table = useReactTable<KeyboardShortcut>({
    data: tableData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    meta: {
      editing: editingKS,
      setEditing: setEditingKS,
      setValue: handleUserKSEdit
    }
  })

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter shortcuts..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export function KeyboardShortcutsDialog({
  open, onOpenChange
}: {
  open: boolean,
  onOpenChange: (open: boolean) => void
}) {
  const [refreshData, setRefreshData] = useState(false)
  const data = useMemo(getRegisteredShortcuts, [refreshData])

  const handleReset = () => {
    void resetUserShortcuts()
    setRefreshData(p => !p)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-fit max-h-full">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Shortcuts for various Functions across the Application.
          </DialogDescription>
        </DialogHeader>
        <div className="max-w-full max-h-[80vh] overflow-y-auto">
          <KeyboardShortcutsTable data={data} />
        </div>
        <DialogFooter>
          <Button type="button" title="Reset" variant="ghost" size={"sm"} onClick={handleReset}>
            Reset to Default
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default KeyboardShortcutsDialog
