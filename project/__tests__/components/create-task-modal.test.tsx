import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { CreateTaskModal } from "@/components/modals/create-task-modal"

// Mock standard hooks
import { useUIStore } from "@/stores/ui-store"
import { useProjects } from "@/hooks/use-projects"
import { useQuery } from "@tanstack/react-query"
import { useGlobalTaskCreator } from "@/hooks/use-global-task"
import { useRouter } from "next/navigation"

jest.mock("next/navigation", () => ({ useRouter: jest.fn() }))
jest.mock("@/stores/ui-store")
jest.mock("@/hooks/use-projects")
jest.mock("@tanstack/react-query")
jest.mock("@/hooks/use-global-task")

// Replace the complex editor with a simple native textarea so jsdom doesn't crash.
jest.mock("@/components/shared/rich-text-editor", () => ({
  RichTextEditor: ({ value, onChange, placeholder, disabled }: any) => (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      data-testid="mock-rich-text"
    />
  ),
}))

// Mock AssigneeSelector to keep it simple
jest.mock("@/components/shared/assignee-selector", () => ({
  AssigneeSelector: () => <div data-testid="assignee-selector">Mock Assignee Selector</div>,
}))

jest.mock("uploadthing/server", () => ({
  UTApi: jest.fn().mockImplementation(() => ({
    uploadFiles: jest.fn(),
    deleteFiles: jest.fn(),
  })),
}))
jest.mock("next/navigation", () => ({ useRouter: jest.fn() }))

describe("CreateTaskModal Component", () => {
  const mockCloseModal = jest.fn()
  const mockMutate = jest.fn()

  beforeEach(() => {
    // UI Store Mock
    ;(useUIStore as unknown as jest.Mock).mockReturnValue({
      isCreateTaskModalOpen: true,
      closeCreateTaskModal: mockCloseModal,
    })

    // Projects Mock
    ;(useProjects as jest.Mock).mockReturnValue({
      projects: [{ id: "proj_1", title: "Test Project", status: "active" }],
      isLoading: false,
    })

    // React Query Mock (for fetching lists)
    ;(useQuery as jest.Mock).mockReturnValue({
      data: [{ id: "list_1", title: "To Do" }],
      isLoading: false,
    })

    // Global Task Creator Mock
    ;(useGlobalTaskCreator as jest.Mock).mockReturnValue({
      createGlobalTask: { mutate: mockMutate, isPending: false },
      isUploading: false,
    })

    // Router Mock
    ;(useRouter as jest.Mock).mockReturnValue({ push: jest.fn() })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("renders the modal and its fields correctly", () => {
    render(<CreateTaskModal />)

    expect(screen.getByText("Create New Task")).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/e.g., Update landing page copy/i)).toBeInTheDocument()

    // Checks if mock Rich Text Editor rendered correctly
    expect(screen.getByPlaceholderText(/Add more details to this task/i)).toBeInTheDocument()

    // The Submit button should exist, but be DISABLED initially
    // because no project/list is selected by default
    const submitBtn = screen.getByRole("button", { name: /Create Task/i })
    expect(submitBtn).toBeInTheDocument()
    expect(submitBtn).toBeDisabled()
  })

  it("allows the user to type into the title and description", async () => {
    const user = userEvent.setup()
    render(<CreateTaskModal />)

    const titleInput = screen.getByPlaceholderText(/e.g., Update landing page copy/i)
    const descInput = screen.getByPlaceholderText(/Add more details to this task/i)

    await user.type(titleInput, "Fix Navigation Bug")
    await user.type(descInput, "The mobile menu is not opening.")

    expect(titleInput).toHaveValue("Fix Navigation Bug")
    expect(descInput).toHaveValue("The mobile menu is not opening.")
  })

  it("allows adding labels via the Enter key", async () => {
    const user = userEvent.setup()
    render(<CreateTaskModal />)

    const labelInput = screen.getByPlaceholderText(/Type a label and press Enter/i)

    // Type "bug" and press Enter
    await user.type(labelInput, "bug{enter}")

    // The label text "bug" should now be rendered in the DOM
    expect(screen.getByText("bug")).toBeInTheDocument()

    // The input should be cleared out after hitting enter
    expect(labelInput).toHaveValue("")
  })
})
