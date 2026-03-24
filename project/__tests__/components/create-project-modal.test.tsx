import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { CreateProjectModal } from "@/components/modals/create-project-modal"

// Import the hooks to mock
import { useUIStore } from "@/stores/ui-store"
import { useProjects } from "@/hooks/use-projects"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { useToast } from "@/hooks/use-toast"

// Mock the modules
jest.mock("@/stores/ui-store")
jest.mock("@/hooks/use-projects")
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}))
jest.mock("@clerk/nextjs", () => ({
  useUser: jest.fn(),
}))
jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn().mockReturnValue({ userId: "user_123" }),
  currentUser: jest.fn().mockResolvedValue({ id: "user_123" }),
}))
jest.mock("@/hooks/use-toast", () => ({
  useToast: jest.fn(),
}))
jest.mock("@/hooks/use-projects", () => ({
  useProjects: jest.fn().mockReturnValue({
    projects: [],
    isLoading: false,
    isCreating: false,
    createProject: jest.fn(),
  }),
}))

describe("CreateProjectModal Component", () => {
  const mockCloseModal = jest.fn()
  const mockCreateProject = jest.fn()
  const mockPush = jest.fn()
  const mockToast = jest.fn()

  beforeEach(() => {
    // Setup Zustand Store Mock (Open by default for most tests)
    ;(useUIStore as unknown as jest.Mock).mockReturnValue({
      isCreateProjectModalOpen: true,
      closeCreateProjectModal: mockCloseModal,
    })

    // Setup React Query Mock
    ;(useProjects as jest.Mock).mockReturnValue({
      createProject: mockCreateProject,
      isCreating: false,
    })

    // Setup Next.js Router Mock
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })

    // Setup Clerk User Mock
    ;(useUser as jest.Mock).mockReturnValue({
      user: { id: "user_123", firstName: "Test", lastName: "User" },
    })

    // Setup Toast Mock
    ;(useToast as jest.Mock).mockReturnValue({
      toast: mockToast,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("does not render when isCreateProjectModalOpen is false", () => {
    // Override store for this specific test
    ;(useUIStore as unknown as jest.Mock).mockReturnValue({
      isCreateProjectModalOpen: false,
      closeCreateProjectModal: mockCloseModal,
    })

    render(<CreateProjectModal />)

    // The dialog title shouldn't be on the screen
    expect(screen.queryByText("Create New Project")).not.toBeInTheDocument()
  })

  it("renders the modal with correct fields when open", () => {
    render(<CreateProjectModal />)

    // Checks if main UI elements are present
    expect(screen.getByText("Create New Project")).toBeInTheDocument()

    expect(screen.getByPlaceholderText(/e.g., Q3 Marketing Campaign/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Briefly describe the project goals/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Create Project/i })).toBeInTheDocument()
  })

  it("allows user to type and close the modal", async () => {
    const user = userEvent.setup()
    render(<CreateProjectModal />)

    const titleInput = screen.getByPlaceholderText(/e.g., Q3 Marketing Campaign/i)
    await user.type(titleInput, "My Awesome Project")

    expect(titleInput).toHaveValue("My Awesome Project")

    // Click cancel
    const cancelButton = screen.getByRole("button", { name: /Cancel/i })
    await user.click(cancelButton)

    // Ensure our Zustand close function was called
    expect(mockCloseModal).toHaveBeenCalledTimes(1)
  })

  it("shows loading state when isCreating is true", () => {
    // Override useProjects to simulate loading state
    ;(useProjects as jest.Mock).mockReturnValue({
      createProject: mockCreateProject,
      isCreating: true, // Set to true!
    })

    render(<CreateProjectModal />)

    // The button text should change and it should be disabled
    const submitButton = screen.getByRole("button", { name: /Creating.../i })
    expect(submitButton).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })
})
