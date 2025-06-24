import type { NextRequest } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import { successResponse, errorResponse } from "@/lib/api-response"
import { handleApiError, AuthenticationError, ValidationError } from "@/lib/errors"
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

    const goals = await db.collection("goals").findOne({ userId: new ObjectId(decoded.userId) })

    if (!goals) {
      return errorResponse("No goals found", 404, "GOALS_NOT_FOUND")
    }

    return successResponse({ goals }, "Goals retrieved successfully")
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

    // Check if goals already exist
    const existingGoals = await db.collection("goals").findOne({ userId: new ObjectId(decoded.userId) })

    if (existingGoals) {
      throw new ValidationError("Goals already exist. Use PUT to update.")
    }

    const goalData = {
      userId: new ObjectId(decoded.userId),
      workouts: Number(workouts),
      duration: Number(duration),
      calories: Number(calories),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("goals").insertOne(goalData)

    const goals = {
      id: result.insertedId,
      ...goalData,
      userId: decoded.userId,
    }

    return successResponse({ goals }, "Goals set successfully", 201)
  } catch (error) {
    const { error: errorMessage, statusCode, code } = handleApiError(error)
    return errorResponse(errorMessage, statusCode, code)
  }
}
