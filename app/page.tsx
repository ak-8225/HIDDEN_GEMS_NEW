import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const session = await getSession()
  
  // If user is logged in, redirect to explore
  if (session?.user) {
    redirect('/explore')
  }
  
  // If not logged in, redirect to login
  redirect('/login')
}
