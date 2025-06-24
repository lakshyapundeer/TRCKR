"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Calendar, Target, TrendingUp } from "lucide-react"

interface Workout {
  _id: string
  workoutType: string
  duration: number
  intensity: "slow" | "medium" | "intense"
  date: string
  calories: number
}

interface DashboardStatsProps {
  workouts: Workout[]
}

export function DashboardStats({ workouts }: DashboardStatsProps) {
  const totalWorkouts = workouts.length
  const totalCalories = workouts.reduce((sum, workout) => sum + workout.calories, 0)
  const totalDuration = workouts.reduce((sum, workout) => sum + workout.duration, 0)
  const averageCalories = totalWorkouts > 0 ? Math.round(totalCalories / totalWorkouts) : 0

  // Calculate this week's workouts
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const thisWeekWorkouts = workouts.filter((workout) => new Date(workout.date) >= oneWeekAgo).length

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalWorkouts}</div>
          <p className="text-xs text-muted-foreground">{thisWeekWorkouts} this week</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Calories</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCalories.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">{averageCalories} avg per workout</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Duration</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Math.round(totalDuration / 60)}h</div>
          <p className="text-xs text-muted-foreground">{totalDuration} minutes total</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Week</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{thisWeekWorkouts}</div>
          <p className="text-xs text-muted-foreground">{thisWeekWorkouts > 0 ? "Keep it up!" : "Start tracking!"}</p>
        </CardContent>
      </Card>
    </div>
  )
}
