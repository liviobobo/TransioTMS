import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/utils/auth'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (isLoading) return

    if (isAuthenticated) {
      router.replace('/dashboard')
    } else {
      router.replace('/login')
    }
  }, [isAuthenticated, isLoading, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50">
      <div className="text-center">
        <div className="spinner w-8 h-8 mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-primary-600 mb-2">Transio</h1>
        <p className="text-secondary-600">Sistem Management Transport</p>
        <p className="text-secondary-500 text-sm mt-2">Se încarcă...</p>
      </div>
    </div>
  )
}