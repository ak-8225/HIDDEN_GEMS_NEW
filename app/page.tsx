import { redirect } from 'next/navigation'
import { auth } from '@/app/api/auth/[...nextauth]/route'

export default async function Home() {
  const session = await auth()
  
  // If user is logged in, redirect to explore
  if (session?.user) {
    redirect('/explore')
  }
  
  // If not logged in, redirect to login
  redirect('/login')
}
