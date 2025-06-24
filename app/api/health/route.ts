import { NextResponse } from "next/server"

export async function GET() {
  try {
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "unknown",
      version: "1.0.0",
      database: "checking",
    }

    // Quick database check
    if (process.env.MONGODB_URI) {
      try {
        const { getDatabase } = await import("@/lib/mongodb")
        const db = await Promise.race([
          getDatabase(),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000)),
        ])
        await (db as any).admin().ping()
        health.database = "connected"
      } catch (dbError) {
        health.database = "disconnected"
        health.status = "degraded"
      }
    }

    return NextResponse.json(health)
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        error: "Health check failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
