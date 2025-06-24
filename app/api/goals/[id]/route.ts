import type { NextRequest } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import { successResponse, errorResponse } from "@/lib/api-response"
import { handleApiError, AuthenticationError, NotFoundError, ValidationError } from "@/lib/errors"
import { ObjectId } from "mongodb"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("token")?.value

    if (!token) {
      throw new AuthenticationError()
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      throw new AuthenticationError("Invalid token")
    }

    const body = await request.json()
    const { workouts, duration, calories } = body

    // Validate input
    if (!workouts || !duration || !calories) {
      throw new ValidationError("All goal fields are required")
    }

    if (workouts < 1 || workouts > 10) {
      throw new ValidationError("Daily workouts must be between 1 and 10")
    }

    if (duration < 10 || duration > 600) {
      throw new ValidationError("Daily duration must be between 10 and 600 minutes")
    }

    if (calories < 50 || calories > 2000) {
      throw new ValidationError("Daily calories must be between 50 and 2000")
    }

    const db = await getDatabase()

    const result = await db.collection("goals").updateOne(
      {
        _id: new ObjectId(params.id),
        userId: new ObjectId(decoded.userId),
      },
      {
        $set: {
          workouts: Number(workouts),
          duration: Number(duration),
          calories: Number(calories),
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      throw new NotFoundError("Goals not found")
    }

    return successResponse(null, "Goals updated successfully")
  } catch (error) {
    const { error: errorMessage, statusCode, code } = handleApiError(error)
    return errorResponse(errorMessage, statusCode, code)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const result = await db.collection("goals").deleteOne({
      _id: new ObjectId(params.id),
      userId: new ObjectId(decoded.userId),
    })

    if (result.deletedCount === 0) {
      throw new NotFoundError("Goals not found")
    }

    return successResponse(null, "Goals deleted successfully")
  } catch (error) {
    const { error: errorMessage, statusCode, code } = handleApiError(error)
    return errorResponse(errorMessage, statusCode, code)
  }
}
