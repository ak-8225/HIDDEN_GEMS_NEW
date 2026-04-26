import { registerUser } from '../config'

export async function POST(request: Request) {
  try {
    const { email, password, confirmPassword, name } = await request.json()

    // Validation
    if (!email || !password || !name) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (password !== confirmPassword) {
      return Response.json({ error: 'Passwords do not match' }, { status: 400 })
    }

    if (password.length < 6) {
      return Response.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    // Register user
    const result = await registerUser(email, password, name)

    if (!result.success) {
      return Response.json({ error: result.error }, { status: 400 })
    }

    return Response.json({ success: true, message: 'Account created successfully' })
  } catch (error) {
    console.error('Signup error:', error)
    return Response.json({ error: 'Signup failed' }, { status: 500 })
  }
}
