"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Toast } from "@/components/ui/toast"
import { DashboardStats } from "@/components/dashboard-stats"
import { GoalsManager } from "@/components/goals-manager"
import { ProgressTracker } from "@/components/progress-tracker"
import { Trash2, Edit, Plus, LogOut, CalendarDays } from "lucide-react"
import { WORKOUT_TYPES } from "@/lib/calories"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DailySummary } from "@/components/daily-summary"

interface Workout {
  _id: string
  workoutType: string
  duration: number
  intensity: "slow" | "medium" | "intense"
  date: string
  calories: number
}

interface Goal {
  _id?: string
  workouts: number
  duration: number
  calories: number
}

interface ToastState {
  show: boolean
  message: string
  variant: "success" | "error"
}

export default function Dashboard() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [goals, setGoals] = useState<Goal | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState<ToastState>({ show: false, message: "", variant: "success" })
  const [formData, setFormData] = useState({
    workoutType: "",
    duration: "",
    intensity: "medium" as "slow" | "medium" | "intense",
    date: new Date().toISOString().split("T")[0],
  })
  // Initialize selectedDate with today's date
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  useEffect(() => {
    if (!loading && !user) {
      router.push("/signin")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchWorkouts()
      fetchGoals()
    }
  }, [user])

  const showToast = (message: string, variant: "success" | "error" = "success") => {
    setToast({ show: true, message, variant })
  }

  const fetchWorkouts = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/workouts")
      if (response.ok) {
        const data = await response.json()
        setWorkouts(data.data.workouts)
      } else {
        showToast("Failed to fetch workouts", "error")
      }
    } catch (error) {
      showToast("Failed to fetch workouts", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchGoals = async () => {
    try {
      const response = await fetch("/api/goals")
      if (response.ok) {
        const data = await response.json()
        setGoals(data.data.goals)
      }
      // Don't show error for 404 (no goals set yet)
    } catch (error) {
      // Silently handle goals fetch error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = editingWorkout ? `/api/workouts/${editingWorkout._id}` : "/api/workouts"
      const method = editingWorkout ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        fetchWorkouts()
        setIsAddDialogOpen(false)
        setEditingWorkout(null)
        setFormData({
          workoutType: "",
          duration: "",
          intensity: "medium",
          date: new Date().toISOString().split("T")[0],
        })
        showToast(editingWorkout ? "Workout updated successfully" : "Workout added successfully")
      } else {
        const errorData = await response.json()
        showToast(errorData.error?.message || "Failed to save workout", "error")
      }
    } catch (error) {
      showToast("Failed to save workout", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this workout?")) {
      try {
        const response = await fetch(`/api/workouts/${id}`, {
          method: "DELETE",
        })
        if (response.ok) {
          fetchWorkouts()
          showToast("Workout deleted successfully")
        } else {
          showToast("Failed to delete workout", "error")
        }
      } catch (error) {
        showToast("Failed to delete workout", "error")
      }
    }
  }

  const handleEdit = (workout: Workout) => {
    setEditingWorkout(workout)
    setFormData({
      workoutType: workout.workoutType,
      duration: workout.duration.toString(),
      intensity: workout.intensity,
      date: new Date(workout.date).toISOString().split("T")[0],
    })
    setIsAddDialogOpen(true)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/signin")
  }

  const handleGoalUpdate = () => {
    fetchGoals()
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
    }
  }

  const resetToToday = () => {
    setSelectedDate(new Date())
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {toast.show && (
        <Toast
          title={toast.variant === "success" ? "Success" : "Error"}
          description={toast.message}
          variant={toast.variant}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">TRCKR</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Welcome, {user.name}</span>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overall Stats */}
        <div className="mb-8">
          <DashboardStats workouts={workouts} />
        </div>

        {/* Goals and Progress Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <GoalsManager onGoalUpdate={handleGoalUpdate} showToast={showToast} />
          <ProgressTracker goals={goals} workouts={workouts} selectedDate={selectedDate} />
        </div>

        {/* Date Selection and Daily Summary */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-xl font-semibold">Daily Progress</h2>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <CalendarDays className="w-4 h-4 mr-2" />
                    {selectedDate.toLocaleDateString()}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    workoutDates={workouts.map((w) => new Date(w.date).toISOString().split("T")[0])}
                  />
                  <div className="p-3 border-t">
                    <Button variant="outline" size="sm" onClick={resetToToday} className="w-full">
                      Go to Today
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Workout
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingWorkout ? "Edit Workout" : "Add New Workout"}</DialogTitle>
                    <DialogDescription>
                      {editingWorkout ? "Update your workout details" : "Record your fitness activity"}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="workoutType">Workout Type</Label>
                      <Select
                        value={formData.workoutType}
                        onValueChange={(value) => setFormData({ ...formData, workoutType: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select workout type" />
                        </SelectTrigger>
                        <SelectContent>
                          {WORKOUT_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        required
                        min="1"
                        max="600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="intensity">Intensity</Label>
                      <Select
                        value={formData.intensity}
                        onValueChange={(value: "slow" | "medium" | "intense") =>
                          setFormData({ ...formData, intensity: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="slow">Slow</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="intense">Intense</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                        max={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <LoadingSpinner size="sm" text={editingWorkout ? "Updating..." : "Adding..."} />
                      ) : editingWorkout ? (
                        "Update Workout"
                      ) : (
                        "Add Workout"
                      )}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Daily Summary for Selected Date */}
          <DailySummary selectedDate={selectedDate} workouts={workouts} />
        </div>

        {/* Workout History Section - Moved to Bottom */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-xl font-semibold">All Workout History</h2>
            <div className="text-sm text-gray-500">
              {workouts.length} total workout{workouts.length !== 1 ? "s" : ""} recorded
            </div>
          </div>

          {/* Workout List */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" text="Loading workouts..." />
            </div>
          ) : (
            <div className="grid gap-4">
              {workouts.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No workouts recorded yet</p>
                    <p className="text-sm text-gray-400">Add your first workout to start tracking your progress!</p>
                  </CardContent>
                </Card>
              ) : (
                workouts.map((workout) => (
                  <Card key={workout._id}>
                    <CardContent className="flex items-center justify-between p-6">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="font-semibold capitalize">{workout.workoutType}</h3>
                          <p className="text-sm text-gray-600">{new Date(workout.date).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="secondary">{workout.duration} min</Badge>
                          <Badge
                            variant="outline"
                            className={
                              workout.intensity === "intense"
                                ? "border-red-500 text-red-700"
                                : workout.intensity === "medium"
                                  ? "border-yellow-500 text-yellow-700"
                                  : "border-green-500 text-green-700"
                            }
                          >
                            {workout.intensity}
                          </Badge>
                          <Badge variant="default">{workout.calories} cal</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(workout)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(workout._id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
