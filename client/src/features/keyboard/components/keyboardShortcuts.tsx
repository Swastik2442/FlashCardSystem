import { memo, useEffect, useState } from "react"
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
import { useIsMobile } from "@/hooks/useMobile"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Text } from "@/components/ui/text"
import {
  KeyboardInput,
  ShowKeyboardKeys
} from "@/features/keyboard/components/keyboardInput"
import {
  getRegisteredShortcuts,
  setUserShortcut,
  resetUserShortcuts
} from "@/features/keyboard/ks"
import type {
  KeyboardShortcut,
  KeyPressConfig
} from "@/features/keyboard/types"

declare module "@tanstack/react-table" {
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
      <Text value={row.original.name} />
    ),
  },
  {
    accessorKey: "shortcut",
    header: "Shortcut",
    cell: ({ row, table: { options: { meta } } }) => {
      const config = row.original.userConfig ?? row.original.defaultConfig
      return (
        <>
        {meta!.editing == row.index ? (
          <KeyboardInput
            value={config}
            setValue={meta!.setValue}
            cancelEditing={() => meta!.setEditing(-1)}
          />
        ) : (
          <div className="hover:cursor-pointer">
            <ShowKeyboardKeys
              config={config}
              onClick={() => meta?.setEditing(row.index)}
              className="border-background"
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
      <Text value={Array.from(row.original.where).sort().join(", ")} />
    )
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <Text value={row.original.description} />
    )
  }
]

/**
 * Table Component for showcasing all the Keyboard Shortcuts
 */
export const KeyboardShortcutsTable = memo(() => {
  const [tableData, setTableData] = useState(getRegisteredShortcuts)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [editingKS, setEditingKS] = useState(-1)

  // Edit a specific User Shortcut
  const handleUserKSEdit = (config: Nullable<KeyPressConfig>) => {
    void setUserShortcut(editingKS, config)
    setTableData(old => {
      old[editingKS].userConfig = config
      return old
    })
    setEditingKS(-1)
  }

  // Reset all Keyboard Shortcuts to Default
  const handleUserKSReset = () => {
    setEditingKS(-1)
    void resetUserShortcuts()
    setTableData(old => old.map(v => ({
      ...v,
      userConfig: null
    })))
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

  // Toggle Columns Visibility as per Screen Size
  const isMobile = useIsMobile()
  useEffect(() => {
    const whereCol = table.getColumn("where")
    if (isMobile && whereCol?.getIsVisible()) {
      whereCol.toggleVisibility(false)
    } else if (!isMobile && !(whereCol?.getIsVisible())) {
      // BUG: will override user selected column in columns checkbox
      whereCol?.toggleVisibility(true)
    }
  }, [table, isMobile])

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
        <Table className="table-fixed">
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
      <div className="float-end py-4">
        <Button type="button" title="Reset" variant="ghost" size="sm" onClick={handleUserKSReset}>
          Reset to Default
        </Button>
      </div>
    </div>
  )
})

/**
 * Dialog Component for showcasing all the Keyboard Shortcuts
 */
export const KeyboardShortcutsDialog = memo(({
  open, onOpenChange
}: {
  open: boolean,
  onOpenChange: (open: boolean) => void
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-full">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Shortcuts for various Functions across the Application.
          </DialogDescription>
        </DialogHeader>
        <div className="max-w-full max-h-[80vh] overflow-y-auto">
          <KeyboardShortcutsTable />
        </div>
      </DialogContent>
    </Dialog>
  )
})

export default KeyboardShortcutsDialog
