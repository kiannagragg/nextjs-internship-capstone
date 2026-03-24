import { z } from "zod"

/* ==================== UPDATE MEMBER ROLE ==================== */

export const updateRoleSchema = z.object({
  targetUserId: z.string().uuid("Invalid user ID"),
  newRole: z.enum(["admin", "contributor", "viewer"], {
    message: "Role must be admin, contributor, or viewer",
  }),
})

/* ==================== REMOVE MEMBER ==================== */

export const removeMemberSchema = z.object({
  targetUserId: z.string().uuid("Invalid user ID"),
})

/* ==================== TYPES ==================== */

export type UpdateRoleInput = z.infer<typeof updateRoleSchema>
export type RemoveMemberInput = z.infer<typeof removeMemberSchema>
