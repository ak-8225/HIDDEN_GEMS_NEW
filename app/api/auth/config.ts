import Credentials from 'next-auth/providers/credentials'
import { compare, hash } from 'bcryptjs'
import fs from 'fs'
import path from 'path'

// Path to store users data
const usersFilePath = path.join(process.cwd(), 'data', 'users.json')

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Get all users from file
function getAllUsers() {
  try {
    ensureDataDir()
    if (fs.existsSync(usersFilePath)) {
      const data = fs.readFileSync(usersFilePath, 'utf-8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading users file:', error)
  }
  return []
}

// Save users to file
function saveUsers(users: any[]) {
  try {
    ensureDataDir()
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2))
  } catch (error) {
    console.error('Error saving users file:', error)
  }
}

// Register new user
export async function registerUser(email: string, password: string, name: string) {
  try {
    const users = getAllUsers()
    
    // Check if user already exists
    if (users.find((u: any) => u.email === email)) {
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
    saveUsers(users)
    
    return { success: true, user: { id: newUser.id, email, name } }
  } catch (error) {
    console.error('Registration error:', error)
    return { success: false, error: 'Registration failed' }
  }
}

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: Record<string, string> | undefined) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const users = getAllUsers()
        const user = users.find((u: any) => u.email === credentials.email)

        if (!user) {
          return null
        }

        const isPasswordValid = await compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id
      }
      return session
    },
  },
}
