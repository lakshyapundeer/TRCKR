import { ValidationError } from "./errors"

export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new ValidationError("Invalid email format")
  }
}

export function validatePassword(password: string): void {
  if (password.length < 6) {
    throw new ValidationError("Password must be at least 6 characters long")
  }
}

export function validateWorkoutData(data: {
  workoutType: string
  duration: number
  intensity: string
  date: string
}): void {
  const { workoutType, duration, intensity, date } = data

  if (!workoutType || typeof workoutType !== "string") {
    throw new ValidationError("Workout type is required")
  }

  if (!duration || duration <= 0) {
    throw new ValidationError("Duration must be greater than 0")
  }

  if (!["slow", "medium", "intense"].includes(intensity)) {
    throw new ValidationError("Invalid intensity level")
  }

  if (!date || isNaN(new Date(date).getTime())) {
    throw new ValidationError("Invalid date format")
  }
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, "")
}
