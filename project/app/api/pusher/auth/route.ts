/* ============================================
   Pusher Auth Endpoint

   Validates that the requesting user is a member
   of the project before granting access to the
   private channel.

   Route: POST /api/pusher/auth
   ============================================ */

import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { getUserByClerkId } from "@/lib/db/queries/users"
import { getUserProjectRole } from "@/lib/db/queries/projects"
import { authenticateChannel } from "@/lib/pusher/server"

export async function POST(request: NextRequest) {
  try {
    // 1. Verify the user is authenticated
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 2. Get the DB user
    const dbUser = await getUserByClerkId(user.id)
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 401 })
    }

    // 3. Parse the Pusher auth request body
    const body = await request.text()
    const params = new URLSearchParams(body)
    const socketId = params.get("socket_id")
    const channelName = params.get("channel_name")

    if (!socketId || !channelName) {
      return NextResponse.json({ error: "Missing socket_id or channel_name" }, { status: 400 })
    }

    // 4. Validate channel access
    //    Channel format: private-project-{projectId}
    if (channelName.startsWith("private-project-")) {
      const projectId = channelName.replace("private-project-", "")

      // Check the user is a member of this project
      const role = await getUserProjectRole(projectId, dbUser.id)
      if (!role) {
        return NextResponse.json({ error: "You are not a member of this project" }, { status: 403 })
      }
    } else {
      // Unknown channel pattern — deny
      return NextResponse.json({ error: "Unknown channel" }, { status: 403 })
    }

    // 5. Generate the auth response
    const authResponse = authenticateChannel(socketId, channelName)

    return NextResponse.json(authResponse)
  } catch (error) {
    //console.error("[Pusher Auth] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
