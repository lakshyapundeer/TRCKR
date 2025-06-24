import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

export function hashPassword(password: string) {
  try {
    console.log("Hashing password with bcrypt...")
    const hashed = bcrypt.hashSync(password, 12)
    console.log("Password hashed successfully")
    return hashed
  } catch (error) {
    console.error("Password hashing error:", error)
    throw new Error("Failed to hash password")
  }
}

export function verifyPassword(password: string, hashedPassword: string) {
  try {
    return bcrypt.compareSync(password, hashedPassword)
  } catch (error) {
    console.error("Password verification error:", error)
    return false
  }
}

export function generateToken(userId: string) {
  try {
    const JWT_SECRET = process.env.JWT_SECRET

    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET environment variable is not configured")
    }

    console.log("Generating JWT token for user:", userId)
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" })
    console.log("JWT token generated successfully")
    return token
  } catch (error) {
    console.error("Token generation error:", error)
    throw new Error("Failed to generate authentication token")
  }
}

export function verifyToken(token: string) {
  try {
    const JWT_SECRET = process.env.JWT_SECRET

    if (!JWT_SECRET) {
      console.error("JWT_SECRET is not configured")
      return null
    }

    return jwt.verify(token, JWT_SECRET) as { userId: string }
  } catch (error) {
    console.error("Token verification error:", error)
    return null
  }
}
