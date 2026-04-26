import Credentials from 'next-auth/providers/credentials'
import { getAllUsers, registerUser, verifyPassword } from '@/lib/db'

export { registerUser }

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

        const users = await getAllUsers()
        const user = users.find((u) => u.email === credentials.email)

        if (!user) {
          return null
        }

        const isPasswordValid = await verifyPassword(
          user.password,
          credentials.password
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
