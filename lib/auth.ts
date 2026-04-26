import { getServerSession } from 'next-auth'
import { authConfig } from '@/app/api/auth/config'

export async function getSession() {
  return await getServerSession(authConfig)
}
