import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Bot, BookOpen, Video } from 'lucide-react';
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

const featureCards = [
  {
    title: 'Sign Language Translator',
    description: 'Bridge communication gaps by translating sign language to text and speech in real-time.',
    icon: Video,
    link: '/sign-language',
    imageId: 'sign-language',
  },
  {
    title: 'Empathetic AI Companion',
    description: 'Chat with a supportive AI friend designed to listen, understand, and offer encouragement.',
    icon: Bot,
    link: '/companion',
    imageId: 'ai-companion',
  },
  {
    title: 'Mood Journal',
    description: 'Track your emotions and gain insights into your mental well-being through guided journaling.',
    icon: BookOpen,
    link: '/journal',
    imageId: 'journaling',
  },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-headline text-3xl mb-1">Welcome to KindMind</h2>
        <p className="text-muted-foreground">
          Let intelligence make the world kinder. Here are some tools to help you on your journey.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {featureCards.map((feature) => {
          const placeholder = PlaceHolderImages.find(p => p.id === feature.imageId);
          return (
            <Card key={feature.title} className="flex flex-col">
              <CardHeader className="flex-row items-start gap-4">
                <div className="bg-primary/10 text-primary p-3 rounded-lg">
                  <feature.icon className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                 {placeholder && (
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg mb-4">
                        <Image
                            src={placeholder.imageUrl}
                            alt={placeholder.description}
                            data-ai-hint={placeholder.imageHint}
                            fill
                            className="object-cover"
                        />
                    </div>
                )}
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={feature.link}>
                    Open Tool <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
