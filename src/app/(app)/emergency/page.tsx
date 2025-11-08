'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Siren, ShieldQuestion, Volume2 } from 'lucide-react';
import { getTextToSpeech } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

const emergencyPhrases = [
  { text: 'I need help.', icon: AlertTriangle },
  { text: 'Call the police.', icon: Siren },
  { text: 'Where is the nearest hospital?', icon: ShieldQuestion },
  { text: "I'm having an emergency.", icon: AlertTriangle },
];

export default function EmergencyPage() {
  const [selectedPhrase, setSelectedPhrase] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePhraseSelect = async (phrase: string) => {
    setSelectedPhrase(phrase);
    setIsLoading(true);
    setAudioUrl(null);
    try {
      const speechResponse = await getTextToSpeech({ text: phrase });
      setAudioUrl(speechResponse.media);
    } catch (error) {
      console.error('Failed to generate speech:', error);
      toast({
        title: 'Audio Error',
        description: 'Could not generate audio for this phrase.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  return (
    <div className="container mx-auto flex flex-col items-center justify-center gap-8 py-8 text-center">
      
      <div className="flex flex-col items-center gap-2">
        <Siren className="h-16 w-16 text-destructive" />
        <h1 className="text-4xl font-bold font-headline text-destructive">Emergency Mode</h1>
        <p className="max-w-md text-muted-foreground">
          Tap a phrase to display it in large text and generate audio for others to hear.
        </p>
      </div>

      {!selectedPhrase ? (
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Select a Phrase</CardTitle>
            <CardDescription>Choose the message you need to communicate urgently.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {emergencyPhrases.map((phrase) => (
              <Button
                key={phrase.text}
                variant="destructive"
                className="h-20 text-lg flex items-center justify-center gap-2"
                onClick={() => handlePhraseSelect(phrase.text)}
              >
                <phrase.icon className="h-5 w-5" />
                {phrase.text}
              </Button>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full max-w-2xl animate-pulse-slow border-4 border-destructive bg-destructive/10">
          <CardContent className="flex flex-col items-center justify-center p-8 sm:p-12 gap-8">
            <p className="text-5xl md:text-7xl font-bold text-destructive-foreground break-words">
              {selectedPhrase}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <Button onClick={playAudio} disabled={isLoading || !audioUrl} className="flex-1 h-14 text-xl">
                <Volume2 className="mr-2 h-6 w-6" />
                {isLoading ? 'Generating Audio...' : 'Play Aloud'}
              </Button>
              <Button variant="secondary" onClick={() => setSelectedPhrase(null)} className="flex-1 h-14 text-xl">
                Choose Another
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
