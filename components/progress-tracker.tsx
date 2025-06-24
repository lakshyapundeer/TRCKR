"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Trophy, TrendingUp, CheckCircle } from "lucide-react"

interface Goal {
  _id?: string
  workouts: number
  duration: number
  calories: number
}

interface Workout {
  _id: string
  workoutType: string
  duration: number
  intensity: "slow" | "medium" | "intense"
  date: string
  calories: number
}

interface ProgressTrackerProps {
  goals: Goal | null
  workouts: Workout[]
  selectedDate?: Date | null
}

export function ProgressTracker({ goals, workouts, selectedDate }: ProgressTrackerProps) {
  if (!goals) {
    return null
  }

  // Calculate progress for selected date or today
  const targetDate = selectedDate || new Date()
  const targetDateString = targetDate.toDateString()

  const dayWorkouts = workouts.filter((workout) => {
    const workoutDate = new Date(workout.date).toDateString()
    return workoutDate === targetDateString
  })

  const actualWorkouts = dayWorkouts.length
  const actualDuration = dayWorkouts.reduce((sum, workout) => sum + workout.duration, 0)
  const actualCalories = dayWorkouts.reduce((sum, workout) => sum + workout.calories, 0)

  // Calculate progress percentages
  const workoutProgress = Math.min((actualWorkouts / goals.workouts) * 100, 100)
  const durationProgress = Math.min((actualDuration / goals.duration) * 100, 100)
  const caloriesProgress = Math.min((actualCalories / goals.calories) * 100, 100)

  // Overall progress (average of all three)
  const overallProgress = (workoutProgress + durationProgress + caloriesProgress) / 3

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "text-green-600"
    if (progress >= 75) return "text-blue-600"
    if (progress >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  const getProgressBadge = (progress: number) => {
    if (progress >= 100) return { text: "Completed", variant: "default" as const, color: "bg-green-500" }
    if (progress >= 75) return { text: "Almost There", variant: "secondary" as const, color: "bg-blue-500" }
    if (progress >= 50) return { text: "Good Progress", variant: "secondary" as const, color: "bg-yellow-500" }
    return { text: "Keep Going", variant: "outline" as const, color: "bg-red-500" }
  }

  const formatDate = (date: Date) => {
    const today = new Date()
    if (date.toDateString() === today.toDateString()) {
      return "Today"
    }
    return date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
  }

  const badge = getProgressBadge(overallProgress)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-600" />
          <CardTitle>Progress Tracker</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={badge.variant} className={overallProgress >= 100 ? "bg-green-500 text-white" : ""}>
            {overallProgress >= 100 && <CheckCircle className="w-3 h-3 mr-1" />}
            {badge.text}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Progress for {formatDate(targetDate)}</h3>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className={`text-3xl font-bold ${getProgressColor(overallProgress)}`}>
              {Math.round(overallProgress)}%
            </div>
            <TrendingUp className={`h-6 w-6 ${getProgressColor(overallProgress)}`} />
          </div>
          <Progress value={overallProgress} className="h-3" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Workouts Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Workouts</span>
              <span className={`text-sm font-bold ${getProgressColor(workoutProgress)}`}>
                {actualWorkouts}/{goals.workouts}
              </span>
            </div>
            <Progress value={workoutProgress} className="h-2" />
            <p className="text-xs text-gray-500">{Math.round(workoutProgress)}% complete</p>
          </div>

          {/* Duration Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Duration</span>
              <span className={`text-sm font-bold ${getProgressColor(durationProgress)}`}>
                {actualDuration}/{goals.duration}m
              </span>
            </div>
            <Progress value={durationProgress} className="h-2" />
            <p className="text-xs text-gray-500">{Math.round(durationProgress)}% complete</p>
          </div>

          {/* Calories Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Calories</span>
              <span className={`text-sm font-bold ${getProgressColor(caloriesProgress)}`}>
                {actualCalories}/{goals.calories}
              </span>
            </div>
            <Progress value={caloriesProgress} className="h-2" />
            <p className="text-xs text-gray-500">{Math.round(caloriesProgress)}% complete</p>
          </div>
        </div>

        {/* Motivational Message */}
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          {overallProgress >= 100 ? (
            <p className="text-green-700 font-medium">🎉 Congratulations! You've achieved your daily goals!</p>
          ) : overallProgress >= 75 ? (
            <p className="text-blue-700 font-medium">💪 You're almost there! Keep pushing!</p>
          ) : overallProgress >= 50 ? (
            <p className="text-yellow-700 font-medium">🔥 Good progress! You're halfway to your goals!</p>
          ) : (
            <p className="text-gray-700 font-medium">🚀 Let's get started! Every workout counts!</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
