import { z } from "zod"

/* ==================== INVITE MEMBER ==================== */

export const inviteMemberSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  role: z.enum(["contributor", "viewer"], {
    message: "Role must be contributor or viewer",
  }),
})

/* ==================== RESPOND TO INVITATION ==================== */

export const respondInvitationSchema = z.object({
  invitationId: z.string().uuid("Invalid invitation ID"),
})

/* ==================== CANCEL / RESEND ==================== */

export const cancelInvitationSchema = z.object({
  invitationId: z.string().uuid("Invalid invitation ID"),
})

export const resendInvitationSchema = z.object({
  invitationId: z.string().uuid("Invalid invitation ID"),
})

/* ==================== BULK INVITES (from create-project-modal) ==================== */

export const bulkInviteSchema = z.array(
  z.object({
    email: z.string().email("Invalid email address"),
    role: z.enum(["contributor", "viewer"], {
      message: "Role must be contributor or viewer",
    }),
  })
)

/* ==================== TYPES ==================== */

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>
export type RespondInvitationInput = z.infer<typeof respondInvitationSchema>
export type BulkInviteInput = z.infer<typeof bulkInviteSchema>
