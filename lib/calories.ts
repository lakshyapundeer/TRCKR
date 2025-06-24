// Calories calculation based on workout type, duration, and intensity
const CALORIE_RATES = {
  running: { slow: 8, medium: 12, intense: 16 },
  cycling: { slow: 6, medium: 10, intense: 14 },
  swimming: { slow: 7, medium: 11, intense: 15 },
  yoga: { slow: 3, medium: 4, intense: 5 },
  weightlifting: { slow: 5, medium: 8, intense: 12 },
  walking: { slow: 3, medium: 5, intense: 7 },
  dancing: { slow: 4, medium: 6, intense: 9 },
  boxing: { slow: 8, medium: 12, intense: 16 },
}

export function calculateCalories(
  workoutType: string,
  duration: number,
  intensity: "slow" | "medium" | "intense",
): number {
  const rate = CALORIE_RATES[workoutType as keyof typeof CALORIE_RATES]
  if (!rate) return 0
  return Math.round(rate[intensity] * duration)
}

export const WORKOUT_TYPES = Object.keys(CALORIE_RATES)
