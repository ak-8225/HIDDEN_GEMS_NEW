import Credentials from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'

// Demo users - in production, use a database
const demoUsers = [
  {
    id: '1',
    name: 'Demo User',
    email: 'demo@example.com',
    // Password: demo123 (hashed)
    password: '$2a$10$YqXm/OjqHhXvOLYQZ0gzZ.Y6qKaL8wVx3gF2HqN7KQZhWKKvF8Dpe',
  },
]

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

        const user = demoUsers.find(
          (user) => user.email === credentials.email
        )

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
}
