"use client"

import { useTransition } from "react"
import { useSearchParams, usePathname, useRouter } from "next/navigation"
import { Search, Filter, ArrowUpDown } from "lucide-react"

export function ProjectsToolbar() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()
  const [isPending, startTransition] = useTransition()

  // Grab current values from URL, providing defaults
  const searchQuery = searchParams.get("query")?.toString() || ""
  const currentSort = searchParams.get("sort") || "asc"
  const sortAscending = currentSort === "asc"

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams)
    if (term) {
      params.set("query", term)
    } else {
      params.delete("query")
    }

    // useTransition keeps the UI responsive while the server re-renders the list
    startTransition(() => {
      replace(`${pathname}?${params.toString()}`)
    })
  }

  const toggleSort = () => {
    const params = new URLSearchParams(searchParams)
    params.set("sort", sortAscending ? "desc" : "asc")

    startTransition(() => {
      replace(`${pathname}?${params.toString()}`)
    })
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <div className="relative flex-1">
        <Search
          className={`absolute left-3 top-1/2 -translate-y-1/2 transform text-muted-foreground transition-opacity ${isPending ? "opacity-50" : "opacity-100"}`}
          size={16}
        />
        <input
          type="text"
          placeholder="Search projects..."
          defaultValue={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleSort}
          disabled={isPending}
          className="inline-flex items-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
        >
          <ArrowUpDown size={16} className="mr-2 text-muted-foreground" />
          Sort {sortAscending ? "(A-Z)" : "(Z-A)"}
        </button>
        <button className="inline-flex items-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
          <Filter size={16} className="mr-2 text-muted-foreground" />
          Filter
        </button>
      </div>
    </div>
  )
}
