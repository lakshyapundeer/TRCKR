import type { NextRequest } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import { calculateCalories } from "@/lib/calories"
import { validateWorkoutData } from "@/lib/validation"
import { successResponse, errorResponse } from "@/lib/api-response"
import { handleApiError, AuthenticationError, NotFoundError } from "@/lib/errors"
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
    const { workoutType, duration, intensity, date } = body

    validateWorkoutData({ workoutType, duration: Number(duration), intensity, date })
    const calories = calculateCalories(workoutType, Number(duration), intensity)

    const db = await getDatabase()

    const result = await db.collection("workouts").updateOne(
      {
        _id: new ObjectId(params.id),
        userId: new ObjectId(decoded.userId),
      },
      {
        $set: {
          workoutType,
          duration: Number(duration),
          intensity,
          date: new Date(date),
          calories,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      throw new NotFoundError("Workout not found")
    }

    return successResponse(null, "Workout updated successfully")
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

    const result = await db.collection("workouts").deleteOne({
      _id: new ObjectId(params.id),
      userId: new ObjectId(decoded.userId),
    })

    if (result.deletedCount === 0) {
      throw new NotFoundError("Workout not found")
    }

    return successResponse(null, "Workout deleted successfully")
  } catch (error) {
    const { error: errorMessage, statusCode, code } = handleApiError(error)
    return errorResponse(errorMessage, statusCode, code)
  }
}
