"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Target, Edit, Calendar, Clock, Zap } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface Goal {
  _id?: string
  workouts: number
  duration: number // in minutes
  calories: number
  createdAt?: string
  updatedAt?: string
}

interface GoalsManagerProps {
  onGoalUpdate: () => void
  showToast: (message: string, variant?: "success" | "error") => void
}

export function GoalsManager({ onGoalUpdate, showToast }: GoalsManagerProps) {
  const [goals, setGoals] = useState<Goal | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    workouts: "",
    duration: "",
    calories: "",
  })

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/goals")
      if (response.ok) {
        const data = await response.json()
        setGoals(data.data.goals)
      } else if (response.status !== 404) {
        showToast("Failed to fetch goals", "error")
      }
    } catch (error) {
      showToast("Failed to fetch goals", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const goalData = {
        workouts: Number.parseInt(formData.workouts),
        duration: Number.parseInt(formData.duration),
        calories: Number.parseInt(formData.calories),
      }

      const url = goals ? `/api/goals/${goals._id}` : "/api/goals"
      const method = goals ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goalData),
      })

      if (response.ok) {
        await fetchGoals()
        setIsDialogOpen(false)
        setFormData({ workouts: "", duration: "", calories: "" })
        showToast(goals ? "Goals updated successfully" : "Goals set successfully")
        onGoalUpdate()
      } else {
        const errorData = await response.json()
        showToast(errorData.error?.message || "Failed to save goals", "error")
      }
    } catch (error) {
      showToast("Failed to save goals", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const openDialog = () => {
    if (goals) {
      setFormData({
        workouts: goals.workouts.toString(),
        duration: goals.duration.toString(),
        calories: goals.calories.toString(),
      })
    } else {
      setFormData({ workouts: "", duration: "", calories: "" })
    }
    setIsDialogOpen(true)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <LoadingSpinner size="md" text="Loading goals..." />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          <CardTitle>Daily Goals</CardTitle>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" onClick={openDialog}>
              <Edit className="w-4 h-4 mr-2" />
              {goals ? "Edit Goals" : "Set Goals"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{goals ? "Edit Daily Goals" : "Set Daily Goals"}</DialogTitle>
              <DialogDescription>
                Set your daily fitness targets to track your progress and stay motivated.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workouts">Daily Workouts Target</Label>
                <Input
                  id="workouts"
                  type="number"
                  value={formData.workouts}
                  onChange={(e) => setFormData({ ...formData, workouts: e.target.value })}
                  required
                  min="1"
                  max="10"
                  placeholder="e.g., 2"
                />
                <p className="text-xs text-gray-500">Number of workouts per day</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Daily Duration Target (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  required
                  min="10"
                  max="600"
                  placeholder="e.g., 60"
                />
                <p className="text-xs text-gray-500">Total workout time per day</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="calories">Daily Calories Target</Label>
                <Input
                  id="calories"
                  type="number"
                  value={formData.calories}
                  onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                  required
                  min="50"
                  max="2000"
                  placeholder="e.g., 300"
                />
                <p className="text-xs text-gray-500">Calories to burn per day</p>
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <LoadingSpinner size="sm" text={goals ? "Updating..." : "Setting..."} />
                ) : goals ? (
                  "Update Goals"
                ) : (
                  "Set Goals"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {goals ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-900">{goals.workouts}</div>
              <p className="text-sm text-blue-700">Workouts/day</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Clock className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-900">{goals.duration}</div>
              <p className="text-sm text-green-700">Minutes/day</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Zap className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-900">{goals.calories}</div>
              <p className="text-sm text-orange-700">Calories/day</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No daily goals set yet</p>
            <p className="text-sm text-gray-400">Set your daily fitness targets to track progress!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
