import type { NextRequest } from "next/server"
import { getDatabase, executeWithTimeout } from "@/lib/mongodb"
import { verifyPassword, generateToken } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  console.log("=== SIGNIN API START ===")
  const startTime = Date.now()

  try {
    // Parse request body
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error("❌ JSON parsing failed:", parseError)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request format",
          code: "INVALID_JSON",
        },
        { status: 400 },
      )
    }

    const { email, password } = body

    // Validate input
    if (!email?.trim() || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Email and password are required",
          code: "MISSING_FIELDS",
        },
        { status: 400 },
      )
    }

    const sanitizedEmail = email.toLowerCase().trim()

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(sanitizedEmail)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email format",
          code: "INVALID_EMAIL",
        },
        { status: 400 },
      )
    }

    console.log(`✅ Input validation passed (${Date.now() - startTime}ms)`)

    // Database operations
    let db
    try {
      db = await executeWithTimeout(() => getDatabase(), 10000, "Database connection")
      console.log(`✅ Database connected (${Date.now() - startTime}ms)`)
    } catch (dbError) {
      console.error("❌ Database connection failed:", dbError)
      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed",
          code: "DB_CONNECTION_ERROR",
          details: dbError.message,
          troubleshooting: [
            "Check if MongoDB Atlas cluster is running",
            "Verify network access allows 0.0.0.0/0",
            "Confirm connection string is correct",
          ],
        },
        { status: 500 },
      )
    }

    // Find user
    let user
    try {
      user = await executeWithTimeout(
        () => db.collection("users").findOne({ email: sanitizedEmail }),
        5000,
        "User lookup",
      )
      console.log(`✅ User lookup completed (${Date.now() - startTime}ms)`)
    } catch (lookupError) {
      console.error("❌ User lookup failed:", lookupError)
      return NextResponse.json(
        {
          success: false,
          error: "Database operation failed",
          code: "USER_LOOKUP_ERROR",
          details: lookupError.message,
        },
        { status: 500 },
      )
    }

    if (!user) {
      console.log("❌ User not found")
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password",
          code: "INVALID_CREDENTIALS",
        },
        { status: 401 },
      )
    }

    // Verify password
    let isValidPassword
    try {
      isValidPassword = verifyPassword(password, user.password)
      console.log(`✅ Password verification completed (${Date.now() - startTime}ms)`)
    } catch (passwordError) {
      console.error("❌ Password verification failed:", passwordError)
      return NextResponse.json(
        {
          success: false,
          error: "Password verification failed",
          code: "PASSWORD_VERIFICATION_ERROR",
        },
        { status: 500 },
      )
    }

    if (!isValidPassword) {
      console.log("❌ Invalid password")
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password",
          code: "INVALID_CREDENTIALS",
        },
        { status: 401 },
      )
    }

    // Generate token
    let token
    try {
      token = generateToken(user._id.toString())
      console.log(`✅ Token generated (${Date.now() - startTime}ms)`)
    } catch (tokenError) {
      console.error("❌ Token generation failed:", tokenError)
      return NextResponse.json(
        {
          success: false,
          error: "Token generation failed",
          code: "TOKEN_ERROR",
          details: "JWT_SECRET might be too short (needs 32+ characters)",
        },
        { status: 500 },
      )
    }

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
    }

    console.log(`✅ Signin completed successfully in ${Date.now() - startTime}ms`)

    const response = NextResponse.json({
      success: true,
      message: "Signed in successfully",
      user: userData,
    })

    // Set cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("❌ Unexpected signin error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Sign in failed",
        code: "UNEXPECTED_ERROR",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
