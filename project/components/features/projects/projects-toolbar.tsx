"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams, usePathname, useRouter } from "next/navigation"
import { Search, ArrowUpDown, Archive, LayoutGrid, Filter, X, CheckCircle2 } from "lucide-react"
import { useProjects } from "@/hooks/use-projects"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

export function ProjectsToolbar() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()

  const currentView = searchParams.get("view") || "active"
  const { isLoading } = useProjects({ view: currentView })

  const currentQuery = searchParams.get("query")?.toString() || ""
  const currentSortBy = searchParams.get("sortBy") || "updatedAt"
  const currentSortDir = searchParams.get("sortDir") || "desc"

  // Filters
  const priorities = searchParams.get("priority")?.split(",") || []
  const statuses = searchParams.get("status")?.split(",") || []
  const isOverdue = searchParams.get("overdue") === "true"
  const isPinnedOnly = searchParams.get("pinned") === "true"
  const isMyProjects = searchParams.get("myProjects") === "true"

  const activeFilterCount =
    priorities.length +
    statuses.length +
    (isOverdue ? 1 : 0) +
    (isPinnedOnly ? 1 : 0) +
    (isMyProjects ? 1 : 0)

  const [searchTerm, setSearchTerm] = useState(currentQuery)

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value)
        } else {
          params.delete(key)
        }
      })
      replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [searchParams, pathname, replace]
  )

  const clearFilters = () => {
    updateParams({
      priority: null,
      status: null,
      overdue: null,
      pinned: null,
      myProjects: null,
    })
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm !== currentQuery) {
        updateParams({ query: searchTerm || null })
      }
    }, 300)
    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, currentQuery, updateParams])

  const SORT_OPTIONS = [
    { label: "Last Updated", value: "updatedAt" },
    { label: "Alphabetical", value: "title" },
    { label: "Priority", value: "priority" },
    { label: "Progress", value: "progress" },
    { label: "Due Date", value: "dueDate" },
    { label: "Date Created", value: "createdAt" },
  ]

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      {/* Left side: Search, Sort, and Filter */}
      <div className="flex w-full flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative w-full sm:max-w-md">
          <Search
            className={`absolute left-3 top-1/2 -translate-y-1/2 transform text-muted-foreground transition-opacity ${isLoading ? "opacity-50" : "opacity-100"}`}
            size={16}
          />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Sort and Filter Group */}
        <div className="flex shrink-0 items-center gap-2">
          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2 text-xs text-muted-foreground"
              >
                <ArrowUpDown size={16} />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                SORT BY
              </DropdownMenuLabel>
              {SORT_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onClick={() => {
                    if (currentSortBy === opt.value) {
                      updateParams({ sortDir: currentSortDir === "asc" ? "desc" : "asc" })
                    } else {
                      updateParams({ sortBy: opt.value, sortDir: "asc" })
                    }
                  }}
                  className="flex cursor-pointer items-center justify-between text-sm"
                >
                  {opt.label}
                  {currentSortBy === opt.value && (
                    <span className="text-[10px] uppercase text-foreground">{currentSortDir}</span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Filter Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="relative h-9 gap-2 text-xs text-muted-foreground"
              >
                <Filter size={16} />
                Filter
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-72 p-4">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="font-sans text-xs font-semibold text-muted-foreground">
                  QUICK FILTERS
                </h4>
                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear all
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                {/* Quick Filters */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="overdue" className="text-sm">
                      Overdue Only
                    </Label>
                    <Switch
                      id="overdue"
                      checked={isOverdue}
                      onCheckedChange={(c) => updateParams({ overdue: c ? "true" : null })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="pinned" className="text-sm">
                      Pinned Only
                    </Label>
                    <Switch
                      id="pinned"
                      checked={isPinnedOnly}
                      onCheckedChange={(c) => updateParams({ pinned: c ? "true" : null })}
                    />
                  </div>
                </div>

                {/* Priority Checkboxes */}
                <div className="space-y-2">
                  <Label className="text-xs uppercase text-muted-foreground">Priority</Label>
                  {["high", "medium", "low"].map((p) => (
                    <div key={p} className="flex items-center space-x-2">
                      <Checkbox
                        id={`p-${p}`}
                        checked={priorities.includes(p)}
                        onCheckedChange={(checked) => {
                          const newP = checked
                            ? [...priorities, p]
                            : priorities.filter((x) => x !== p)
                          updateParams({ priority: newP.length ? newP.join(",") : null })
                        }}
                      />
                      <label
                        htmlFor={`p-${p}`}
                        className="text-sm capitalize leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {p}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* View Toggle: Active / Completed / Archived */}
      <div className="flex shrink-0 items-center self-start md:self-auto">
        <div className="flex items-center rounded-lg border border-border bg-muted/50 p-1">
          <button
            onClick={() => updateParams({ view: "active" })}
            className={`inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium transition-all ${currentView === "active" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <LayoutGrid size={14} className="mr-1.5" /> Active
          </button>
          <button
            onClick={() => updateParams({ view: "completed" })}
            className={`inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium transition-all ${currentView === "completed" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <CheckCircle2 size={14} className="mr-1.5" /> Completed
          </button>
          <button
            onClick={() => updateParams({ view: "archived" })}
            className={`inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium transition-all ${currentView === "archived" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Archive size={14} className="mr-1.5" /> Archived
          </button>
        </div>
      </div>
    </div>
  )
}
