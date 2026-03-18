import { useMemo } from "react"
import { useSearchParams } from "next/navigation"

export function useTaskFilter(lists: any[], currentUserId?: string) {
  const searchParams = useSearchParams()

  // URL Parameters
  const searchQuery = searchParams.get("query")?.toLowerCase() || ""
  const priorityFilter = searchParams.get("priority") || "all"
  const assigneeFilter = searchParams.get("assignee") || "all" // "all", "me", "unassigned"
  const showOverdueOnly = searchParams.get("overdue") === "true"
  const showDueWithin7Days = searchParams.get("due7days") === "true"

  const filteredLists = useMemo(() => {
    if (!lists) return []

    // Calculate dates once per render to optimize performance
    const now = new Date()
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    return lists.map((list) => {
      const filteredTasks = (list.tasks || []).filter((task: any) => {
        // 1. Search Filter (matches title or description)
        const matchesSearch =
          !searchQuery ||
          task.title.toLowerCase().includes(searchQuery) ||
          task.description?.toLowerCase().includes(searchQuery)

        // 2. Priority Filter
        const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter

        // 3. Assignee Filter
        let matchesAssignee = true
        if (assigneeFilter === "me" && currentUserId) {
          // Checks both direct assigneeId or an array of assignees (adjust to your Prisma schema)
          matchesAssignee =
            task.assigneeId === currentUserId ||
            task.assignees?.some((a: any) => a.userId === currentUserId)
        } else if (assigneeFilter === "unassigned") {
          matchesAssignee = !task.assigneeId && (!task.assignees || task.assignees.length === 0)
        }

        // 4. Overdue Switch (Tasks with a due date that has passed)
        let matchesOverdue = true
        if (showOverdueOnly) {
          matchesOverdue = !!task.dueDate && new Date(task.dueDate) < now
        }

        // 5. Due within 7 Days Switch (Tasks due from today up to 7 days from now)
        let matchesDue7Days = true
        if (showDueWithin7Days) {
          matchesDue7Days =
            !!task.dueDate &&
            new Date(task.dueDate) >= now &&
            new Date(task.dueDate) <= sevenDaysFromNow
        }

        // A task must pass ALL active filters to be shown
        return (
          matchesSearch && matchesPriority && matchesAssignee && matchesOverdue && matchesDue7Days
        )
      })

      // Return the list with its newly filtered tasks
      return {
        ...list,
        tasks: filteredTasks,
      }
    })
  }, [
    lists,
    searchQuery,
    priorityFilter,
    assigneeFilter,
    showOverdueOnly,
    showDueWithin7Days,
    currentUserId,
  ])

  return filteredLists
}
