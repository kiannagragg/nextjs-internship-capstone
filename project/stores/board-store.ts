// TODO: Task 5.3 - Set up client-side state management with Zustand
// TODO: Task 5.4 - Implement optimistic UI updates for smooth interactions

/*
TODO: Implementation Notes for Interns:

Board state management for Kanban functionality:
- Current project data
- Lists/columns
- Tasks
- Drag and drop state
- Optimistic updates
- Sync with server

Key features:
- Optimistic task creation/updates
- Drag and drop state management
- Real-time synchronization
- Conflict resolution
- Offline support (optional)

Example structure:
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

interface BoardState {
  // Data
  currentProject: Project | null
  lists: List[]
  tasks: Task[]
  
  // UI state
  draggedTask: Task | null
  draggedOverList: string | null
  
  // Loading states
  isLoading: boolean
  isSaving: boolean
  
  // Actions
  loadProject: (projectId: string) => Promise<void>
  createTask: (listId: string, task: Partial<Task>) => Promise<void>
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>
  moveTask: (taskId: string, newListId: string, newPosition: number) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>
  
  // Drag and drop
  setDraggedTask: (task: Task | null) => void
  setDraggedOverList: (listId: string | null) => void
}

export const useBoardStore = create<BoardState>()(
  subscribeWithSelector((set, get) => ({
    // ... implementation
  }))
)
*/

import { create } from "zustand"
import type { ListWithTasks, TaskWithAssignees } from "@/types"

interface BoardState {
  // Data
  projectId: string | null
  lists: ListWithTasks[]

  // Actions
  setBoardData: (projectId: string, lists: ListWithTasks[]) => void
  addListOptimistic: (list: ListWithTasks) => void
  updateListOptimistic: (listId: string, updates: Partial<ListWithTasks>) => void
  removeListOptimistic: (listId: string) => void

  // Drag & Drop / Bulk Actions
  setListsOptimistic: (lists: ListWithTasks[]) => void

  // Task Actions
  addTaskOptimistic: (listId: string, task: TaskWithAssignees) => void
  updateTaskOptimistic: (taskId: string, updates: Partial<TaskWithAssignees>) => void
  removeTaskOptimistic: (taskId: string) => void
}

export const useBoardStore = create<BoardState>((set) => ({
  projectId: null,
  lists: [],

  // --- INITIALIZATION ---
  setBoardData: (projectId, lists) => set({ projectId, lists }),

  // --- LIST ACTIONS ---
  addListOptimistic: (list) => set((state) => ({ lists: [...state.lists, list] })),

  updateListOptimistic: (listId, updates) =>
    set((state) => ({
      lists: state.lists.map((list) => (list.id === listId ? { ...list, ...updates } : list)),
    })),

  removeListOptimistic: (listId) =>
    set((state) => ({
      lists: state.lists.filter((list) => list.id !== listId),
    })),

  // --- DRAG & DROP ACTION ---
  // Overwrites the entire lists array (used by dnd-kit after calculating new positions)
  setListsOptimistic: (newLists) => set({ lists: newLists }),

  // --- TASK ACTIONS ---
  addTaskOptimistic: (listId, task) =>
    set((state) => ({
      lists: state.lists.map((list) =>
        list.id === listId ? { ...list, tasks: [...list.tasks, task] } : list
      ),
    })),

  updateTaskOptimistic: (taskId, updates) =>
    set((state) => ({
      lists: state.lists.map((list) => ({
        ...list,
        tasks: list.tasks.map((task) => (task.id === taskId ? { ...task, ...updates } : task)),
      })),
    })),

  removeTaskOptimistic: (taskId) =>
    set((state) => ({
      lists: state.lists.map((list) => ({
        ...list,
        tasks: list.tasks.filter((task) => task.id !== taskId),
      })),
    })),
}))
