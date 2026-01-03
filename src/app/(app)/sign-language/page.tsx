import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

const SignLanguageClient = dynamic(
  () => import('@/app/(app)/sign-language/sign-language-client'),
  { 
    ssr: false,
    loading: () => (
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Skeleton className="w-full aspect-video" />
          <Skeleton className="h-10 w-32 mt-4" />
        </div>
        <div>
          <Skeleton className="h-[340px] w-full" />
        </div>
      </div>
    )
  }
)

export default function SignLanguagePage() {
  return <SignLanguageClient />
}
