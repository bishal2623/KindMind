import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Bot, BookOpen, Video, Hand, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

const featureCards = [
  {
    title: 'Sign Language Translator',
    description: 'Bridge communication gaps by translating sign language into text.',
    howItWorks: 'Uses camera-based hand gesture detection for real-time understanding.',
    badge: { text: 'LIVE', className: 'bg-[#16a34a] text-[#022c22] hover:bg-[#16a34a]' },
    link: '/sign-language',
    imageId: 'sign-language',
  },
  {
    title: 'Empathetic AI Companion',
    description: 'Chat with a supportive AI designed to listen, understand, and encourage.',
    howItWorks: 'Emotion-aware conversational AI inspired by ChatGPT-style interactions.',
    badge: { text: 'BETA', className: 'bg-[#eab308] text-[#422006] hover:bg-[#eab308]' },
    link: '/companion',
    imageId: 'ai-companion',
  },
  {
    title: 'Mood Journal',
    description: 'Track your emotions and gain insights into your mental well-being.',
    howItWorks: 'Log your feelings and visualize your mood trends over time.',
    badge: { text: 'NEW', className: 'bg-blue-400 text-blue-900 hover:bg-blue-400' },
    link: '/journal',
    imageId: 'journaling',
  },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 text-white">
      <header>
        <h1 className="font-headline text-4xl">Welcome to KindMind</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Let intelligence make the world kinder. Tools built with empathy & accessibility.
        </p>
        <div className="mt-4 max-w-xl rounded-lg border-l-4 border-blue-400 bg-slate-900 p-3 text-sky-200">
          <p>
            <span className="font-bold">👋 New here?</span> Start with the{' '}
            <b>Sign Language Translator</b> to see KindMind in action.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {featureCards.map((feature) => {
          const placeholder = PlaceHolderImages.find((p) => p.id === feature.imageId);
          return (
            <div key={feature.title} className="flex flex-col rounded-2xl bg-[#111827] p-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold font-headline">{feature.title}</h2>
                {feature.badge && (
                  <Badge className={cn('text-xs font-bold', feature.badge.className)}>
                    {feature.badge.text}
                  </Badge>
                )}
              </div>

              {placeholder && (
                <div className="relative my-4 aspect-video w-full overflow-hidden rounded-xl">
                  <Image
                    src={placeholder.imageUrl}
                    alt={placeholder.description}
                    data-ai-hint={placeholder.imageHint}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <p className="text-sm text-slate-300">{feature.description}</p>
              <p className="mt-1.5 text-xs text-slate-400">{feature.howItWorks}</p>
              
              <div className="mt-auto pt-4">
                <Button asChild className="w-full rounded-lg bg-[#38bdf8] text-black font-bold hover:bg-[#0ea5e9]">
                  <Link href={feature.link}>
                    Open Tool <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      
       <footer className="mt-10 text-center text-sm text-slate-400">
          <p>♿ Built with accessibility in mind · ❤️ KindMind Project</p>
          <p>Designed to support inclusive communication and mental well-being.</p>
        </footer>
    </div>
  );
}
