import type { NextRequest } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import { calculateCalories } from "@/lib/calories"
import { validateWorkoutData } from "@/lib/validation"
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

    const workouts = await db
      .collection("workouts")
      .find({ userId: new ObjectId(decoded.userId) })
      .sort({ date: -1 })
      .toArray()

    return successResponse({ workouts }, "Workouts retrieved successfully")
  } catch (error) {
    const { error: errorMessage, statusCode, code } = handleApiError(error)
    return errorResponse(errorMessage, statusCode, code)
  }
}

export async function POST(request: NextRequest) {
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

    // Validate workout data
    validateWorkoutData({ workoutType, duration: Number(duration), intensity, date })

    const calories = calculateCalories(workoutType, Number(duration), intensity)

    const db = await getDatabase()

    const workoutData = {
      userId: new ObjectId(decoded.userId),
      workoutType,
      duration: Number(duration),
      intensity,
      date: new Date(date),
      calories,
      createdAt: new Date(),
    }

    const result = await db.collection("workouts").insertOne(workoutData)

    const workout = {
      id: result.insertedId,
      ...workoutData,
      userId: decoded.userId,
    }

    return successResponse({ workout }, "Workout added successfully", 201)
  } catch (error) {
    const { error: errorMessage, statusCode, code } = handleApiError(error)
    return errorResponse(errorMessage, statusCode, code)
  }
}
