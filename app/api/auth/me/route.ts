import type { NextRequest } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import { successResponse, errorResponse } from "@/lib/api-response"
import { handleApiError, AuthenticationError } from "@/lib/errors"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value

    if (!token) {
      throw new AuthenticationError()
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      throw new AuthenticationError("Invalid token")
    }

    const db = await getDatabase()

    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(decoded.userId) }, { projection: { password: 0 } })

    if (!user) {
      throw new AuthenticationError("User not found")
    }

    return successResponse({ user }, "User retrieved successfully")
  } catch (error) {
    const { error: errorMessage, statusCode, code } = handleApiError(error)
    return errorResponse(errorMessage, statusCode, code)
  }
}
