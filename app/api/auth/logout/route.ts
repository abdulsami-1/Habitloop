import { deleteSession } from "@/lib/session"
import { apiSuccess } from "@/lib/utils"

export async function POST() {
  await deleteSession()
  return apiSuccess({ message: "Logged out" })
}
