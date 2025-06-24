# TRCKR

A comprehensive fitness tracking web application built with Next.js, MongoDB, and TypeScript.

## Features

### 🔐 Authentication
- Secure user registration and login
- JWT-based session management
- Password hashing with bcrypt
- Protected routes with middleware

### 🏃‍♂️ Workout Tracking
- Record workouts with multiple exercise types
- Track duration, intensity, and date
- Automatic calorie calculation
- Edit and delete workout records

### 📊 Analytics
- View workout history
- Track total workouts and calories burned
- Calculate averages and statistics

### 🎨 User Interface
- Responsive design with Tailwind CSS
- Modern UI components with shadcn/ui
- Dark/light mode support
- Mobile-friendly interface

## Tech Stack

- **Frontend**: React 18, Next.js 14 (App Router)
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Authentication**: JWT with HTTP-only cookies
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **Icons**: Lucide React
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB database (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd trckr
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Fill in your environment variables:
   \`\`\`env
   MONGODB_URI=mongodb://localhost:27017/trckr
   JWT_SECRET=your-super-secret-jwt-key-here
   NODE_ENV=development
   \`\`\`

4. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Structure

### Users Collection
\`\`\`javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String, // hashed with bcrypt
  createdAt: Date
}
\`\`\`

### Workouts Collection
\`\`\`javascript
{
  _id: ObjectId,
  userId: ObjectId, // reference to users collection
  workoutType: String, // running, cycling, swimming, etc.
  duration: Number, // in minutes
  intensity: String, // slow, medium, intense
  date: Date,
  calories: Number, // calculated automatically
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

## API Endpoints

#### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login  
- `POST /api/auth/signout` - User logout
- `GET /api/auth/me` - Get current user

#### Workouts
- `GET /api/workouts` - Get user's workouts
- `POST /api/workouts` - Create new workout
- `PUT /api/workouts/[id]` - Update workout
- `DELETE /api/workouts/[id]` - Delete workout

#### System
- `GET /api/health` - System health check
- `GET /api/diagnostic` - System diagnostic (development)

## Workout Types & Calorie Calculation

The application supports 8 different workout types with intensity-based calorie calculation:

| Workout Type | Slow (cal/min) | Medium (cal/min) | Intense (cal/min) |
|--------------|----------------|------------------|-------------------|
| Running      | 8              | 12               | 16                |
| Cycling      | 6              | 10               | 14                |
| Swimming     | 7              | 11               | 15                |
| Yoga         | 3              | 4                | 5                 |
| Weightlifting| 5              | 8                | 12                |
| Walking      | 3              | 5                | 7                 |
| Dancing      | 4              | 6                | 9                 |
| Boxing       | 8              | 12               | 16                |


## Security Features

- Password hashing with bcrypt
- JWT tokens stored in HTTP-only cookies
- CSRF protection with SameSite cookies
- Input validation and sanitization
- Protected API routes with authentication middleware
- Secure environment variable handling


---
