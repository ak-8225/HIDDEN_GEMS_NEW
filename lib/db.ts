import { hash, compare } from 'bcryptjs'

// In-memory user storage (will persist during server runtime on Vercel)
let users: Array<{
  id: string
  email: string
  name: string
  password: string
  createdAt: string
}> = []

// Initialize with demo user
function initializeUsers() {
  if (users.length === 0) {
    // Add demo user
    hash('demo123', 10).then((hashedPassword) => {
      users.push({
        id: '1',
        email: 'demo@example.com',
        name: 'Demo User',
        password: hashedPassword,
        createdAt: new Date().toISOString(),
      })
    })
  }
}

// Initialize on module load
initializeUsers()

export async function getAllUsers() {
  return users
}

export async function getUserByEmail(email: string) {
  return users.find((u) => u.email === email)
}

export async function registerUser(
  email: string,
  password: string,
  name: string
) {
  try {
    // Check if user already exists
    if (users.find((u) => u.email === email)) {
      return { success: false, error: 'Email already registered' }
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      email,
      name,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)

    return { success: true, user: { id: newUser.id, email, name } }
  } catch (error) {
    console.error('Registration error:', error)
    return { success: false, error: 'Registration failed' }
  }
}

export async function verifyPassword(
  storedPassword: string,
  inputPassword: string
) {
  return compare(inputPassword, storedPassword)
}
