'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getSignLanguageTranslation } from '@/app/actions';
import { Video, Mic, Loader2, Circle, Square, Volume2, Info, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


type TranslationState = 'idle' | 'recording' | 'processing' | 'success' | 'error';
interface TranslationResult {
  text: string;
  speechUri: string;
  confidence: number;
}

export default function SignLanguagePage() {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  
  const [translationState, setTranslationState] = useState<TranslationState>('idle');
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const setupCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStream(stream);
      } else {
        toast({ title: 'Camera not supported', description: 'Your browser does not support camera access.', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Camera access denied', description: 'Please allow camera access in your browser settings.', variant: 'destructive' });
      console.error(err);
    }
  };

  useEffect(() => {
    setupCamera();
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startRecording = () => {
    if (!stream) {
      toast({ title: 'Camera not ready', description: 'Please enable camera access first.', variant: 'destructive' });
      return;
    }
    recordedChunksRef.current = [];
    mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm' });

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };
    
    mediaRecorderRef.current.onstop = handleRecordingStop;

    mediaRecorderRef.current.start();
    setTranslationState('recording');
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setTranslationState('processing');
  };

  const handleRecordingStop = () => {
    const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = async () => {
      const base64data = reader.result as string;
      try {
        const res = await getSignLanguageTranslation({ videoDataUri: base64data });
        setResult({ text: res.translatedText, speechUri: res.translatedSpeechUri, confidence: res.confidenceScore });
        setTranslationState('success');
      } catch (error) {
        console.error('Translation failed:', error);
        toast({ title: 'Translation Failed', description: 'We couldn\'t process the video. Please try again.', variant: 'destructive' });
        setTranslationState('error');
      }
    };
  };
  
  const reset = () => {
    setResult(null);
    setTranslationState('idle');
  }

  const playAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play();
  };

  const isProcessing = translationState === 'processing';
  const isRecording = translationState === 'recording';

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2"><Video /> Video Input</CardTitle>
          <CardDescription>Record a short sign language video for translation.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="aspect-video w-full bg-muted rounded-lg overflow-hidden flex items-center justify-center relative">
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover"></video>
            {!stream && <p className="text-muted-foreground">Waiting for camera...</p>}
            {isRecording && <div className="absolute top-2 right-2 flex items-center gap-2 bg-destructive/80 text-destructive-foreground p-1 rounded-md text-xs"><Circle className="h-3 w-3 fill-current" />REC</div>}
          </div>
        </CardContent>
        <CardFooter>
          {!isRecording && !isProcessing && (
             <Button onClick={startRecording} disabled={!stream}>
              <Mic className="mr-2 h-4 w-4" /> Start Recording
            </Button>
          )}
          {isRecording && (
            <Button onClick={stopRecording} variant="destructive">
              <Square className="mr-2 h-4 w-4" /> Stop Recording
            </Button>
          )}
          {isProcessing && (
             <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
            </Button>
          )}
        </CardFooter>
      </Card>
      
      <Card>
         <CardHeader>
            <CardTitle className="font-headline">Translation Output</CardTitle>
            <CardDescription>The translated text and speech will appear here.</CardDescription>
        </CardHeader>
        <CardContent className="min-h-60 flex items-center justify-center">
            {translationState === 'idle' && <p className="text-muted-foreground">Awaiting video...</p>}
            {isProcessing && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
            {translationState === 'error' && (
                <div className="text-center text-destructive">
                    <p>Something went wrong.</p>
                    <Button variant="link" onClick={reset}>Try again</Button>
                </div>
            )}
            {translationState === 'success' && result && (
                <div className="w-full space-y-4">
                    <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertTitle className="font-headline">Translation Successful</AlertTitle>
                        <AlertDescription className="mt-2">
                          <p className="text-lg">{result.text}</p>
                        </AlertDescription>
                    </Alert>
                    
                    <div className="flex justify-between items-center gap-4">
                      <Button onClick={() => playAudio(result.speechUri)}>
                          <Volume2 className="mr-2 h-4 w-4" /> Listen to translation
                      </Button>
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-medium">Confidence</span>
                        <Progress value={result.confidence * 100} className="w-24 h-2 mt-1" />
                        <span className="text-xs text-muted-foreground mt-1">{(result.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>

                </div>
            )}
        </CardContent>
        <CardFooter>
            {translationState === 'success' && (
                 <Button variant="outline" onClick={reset}>Translate another video</Button>
            )}
        </CardFooter>
      </Card>
    </div>
  );
}
