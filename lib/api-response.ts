import { NextResponse } from "next/server"

export function successResponse(data: any, message?: string, statusCode = 200) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode },
  )
}

export function errorResponse(message: string, statusCode = 500, code?: string, details?: any) {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code,
        details,
        timestamp: new Date().toISOString(),
      },
    },
    { status: statusCode },
  )
}
