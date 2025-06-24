"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, Target, TrendingUp } from "lucide-react"

interface Workout {
  _id: string
  workoutType: string
  duration: number
  intensity: "slow" | "medium" | "intense"
  date: string
  calories: number
}

interface DailySummaryProps {
  selectedDate: Date
  workouts: Workout[]
}

export function DailySummary({ selectedDate, workouts }: DailySummaryProps) {
  // Filter workouts for the selected date
  const selectedDateString = selectedDate.toDateString()
  const dayWorkouts = workouts.filter((workout) => {
    const workoutDate = new Date(workout.date).toDateString()
    return workoutDate === selectedDateString
  })

  // Calculate daily totals
  const totalDuration = dayWorkouts.reduce((sum, workout) => sum + workout.duration, 0)
  const totalCalories = dayWorkouts.reduce((sum, workout) => sum + workout.calories, 0)
  const workoutCount = dayWorkouts.length

  const formatDate = (date: Date) => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today's Progress"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday's Progress"
    } else {
      return `Progress for ${date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })}`
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-lg">{formatDate(selectedDate)}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {dayWorkouts.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <TrendingUp className="h-12 w-12 mx-auto mb-2" />
            </div>
            <p className="text-gray-500 text-lg">No workouts recorded for this day</p>
            <p className="text-gray-400 text-sm">
              {selectedDate.toDateString() === new Date().toDateString()
                ? "Add a workout to start tracking today's progress!"
                : "No activity recorded for this date"}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Workouts</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{workoutCount}</div>
                  <p className="text-xs text-muted-foreground">
                    {workoutCount === 1 ? "workout" : "workouts"} completed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Duration</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalDuration} min</div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((totalDuration / 60) * 10) / 10} hours of activity
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Calories</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalCalories}</div>
                  <p className="text-xs text-muted-foreground">
                    {workoutCount > 0 ? Math.round(totalCalories / workoutCount) : 0} avg per workout
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Individual Workouts for the Day */}
            <div>
              <h4 className="font-semibold mb-3">Workouts for this day:</h4>
              <div className="space-y-2">
                {dayWorkouts.map((workout) => (
                  <div key={workout._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="font-medium capitalize">{workout.workoutType}</span>
                        <p className="text-sm text-gray-600">
                          {new Date(workout.date).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">{workout.duration}m</span>
                      <span
                        className={`text-sm px-2 py-1 rounded ${
                          workout.intensity === "intense"
                            ? "bg-red-100 text-red-800"
                            : workout.intensity === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                        }`}
                      >
                        {workout.intensity}
                      </span>
                      <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">
                        {workout.calories} cal
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
