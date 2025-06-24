import type { NextRequest } from "next/server"
import { getDatabase, executeWithTimeout } from "@/lib/mongodb"
import { hashPassword, generateToken } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  console.log("=== SIGNUP API START ===")
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

    const { name, email, password } = body

    // Validate input
    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "All fields are required",
          code: "MISSING_FIELDS",
          details: {
            name: !name?.trim() ? "required" : "ok",
            email: !email?.trim() ? "required" : "ok",
            password: !password ? "required" : "ok",
          },
        },
        { status: 400 },
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email format",
          code: "INVALID_EMAIL",
        },
        { status: 400 },
      )
    }

    // Password validation
    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must be at least 6 characters long",
          code: "WEAK_PASSWORD",
        },
        { status: 400 },
      )
    }

    const sanitizedName = name.trim()
    const sanitizedEmail = email.toLowerCase().trim()

    console.log(`✅ Input validation passed (${Date.now() - startTime}ms)`)

    // Database operations
    let db
    try {
      db = await executeWithTimeout(() => getDatabase(), 5000, "Database connection")
      console.log(`✅ Database connected (${Date.now() - startTime}ms)`)
    } catch (dbError) {
      console.error("❌ Database connection failed:", dbError)
      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed",
          code: "DB_CONNECTION_ERROR",
          details: dbError.message,
        },
        { status: 500 },
      )
    }

    // Check if user exists
    let existingUser
    try {
      existingUser = await executeWithTimeout(
        () => db.collection("users").findOne({ email: sanitizedEmail }),
        3000,
        "User existence check",
      )
      console.log(`✅ User existence check completed (${Date.now() - startTime}ms)`)
    } catch (checkError) {
      console.error("❌ User existence check failed:", checkError)
      return NextResponse.json(
        {
          success: false,
          error: "Database operation failed",
          code: "USER_CHECK_ERROR",
          details: checkError.message,
        },
        { status: 500 },
      )
    }

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "An account with this email already exists",
          code: "USER_EXISTS",
        },
        { status: 409 },
      )
    }

    // Hash password
    let hashedPassword
    try {
      hashedPassword = hashPassword(password)
      console.log(`✅ Password hashed (${Date.now() - startTime}ms)`)
    } catch (hashError) {
      console.error("❌ Password hashing failed:", hashError)
      return NextResponse.json(
        {
          success: false,
          error: "Password processing failed",
          code: "PASSWORD_HASH_ERROR",
        },
        { status: 500 },
      )
    }

    // Create user
    let result
    try {
      result = await executeWithTimeout(
        () =>
          db.collection("users").insertOne({
            name: sanitizedName,
            email: sanitizedEmail,
            password: hashedPassword,
            createdAt: new Date(),
          }),
        3000,
        "User creation",
      )
      console.log(`✅ User created (${Date.now() - startTime}ms)`)
    } catch (createError) {
      console.error("❌ User creation failed:", createError)
      return NextResponse.json(
        {
          success: false,
          error: "Database operation failed",
          code: "USER_CREATION_ERROR",
          details: createError.message,
        },
        { status: 500 },
      )
    }

    // Generate token
    let token
    try {
      token = generateToken(result.insertedId.toString())
      console.log(`✅ Token generated (${Date.now() - startTime}ms)`)
    } catch (tokenError) {
      console.error("❌ Token generation failed:", tokenError)
      return NextResponse.json(
        {
          success: false,
          error: "Token generation failed",
          code: "TOKEN_ERROR",
        },
        { status: 500 },
      )
    }

    const userData = {
      id: result.insertedId,
      name: sanitizedName,
      email: sanitizedEmail,
    }

    console.log(`✅ Signup completed successfully in ${Date.now() - startTime}ms`)

    const response = NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        user: userData,
      },
      { status: 201 },
    )

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
    console.error("❌ Unexpected signup error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Account creation failed",
        code: "UNEXPECTED_ERROR",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
