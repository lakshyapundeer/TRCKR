"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Activity, BarChart3, Calendar, Target } from "lucide-react"

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">TRCKR</h1>
            <div className="flex gap-4">
              <Link href="/signin">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Track Your Fitness Journey with TRCKR</h1>
          <p className="text-xl text-gray-600 mb-8">
            Record your workouts, set daily goals, monitor your progress, and achieve your fitness targets
          </p>
          <Link href="/signup">
            <Button size="lg" className="text-lg px-8 py-3">
              Start Tracking Today
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
          <Card>
            <CardHeader>
              <Activity className="w-8 h-8 text-blue-600 mb-2" />
              <CardTitle>Track Workouts</CardTitle>
              <CardDescription>Record different types of exercises with duration and intensity</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Target className="w-8 h-8 text-green-600 mb-2" />
              <CardTitle>Calculate Calories</CardTitle>
              <CardDescription>Automatically calculate calories burned based on your activities</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Calendar className="w-8 h-8 text-purple-600 mb-2" />
              <CardTitle>Calendar View</CardTitle>
              <CardDescription>View your workouts in a calendar and track daily progress</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Target className="w-8 h-8 text-orange-600 mb-2" />
              <CardTitle>Set Daily Goals</CardTitle>
              <CardDescription>
                Define daily targets for workouts, duration, and calories to stay motivated
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <BarChart3 className="w-8 h-8 text-red-600 mb-2" />
              <CardTitle>Monitor Progress</CardTitle>
              <CardDescription>
                Visualize your fitness progress with detailed statistics and goal tracking
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Start Your Fitness Journey?</h2>
          <p className="text-gray-600 mb-6">Join thousands of users who are already tracking their fitness progress</p>
          <Link href="/signup">
            <Button size="lg">Create Your Account</Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
