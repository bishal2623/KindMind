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
import { Video, Mic, Loader2, Circle, Square, Volume2, HelpCircle, Frown, Smile, CameraOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from '@/components/ui/badge';


type TranslationState = 'idle' | 'recording' | 'processing' | 'success' | 'error';
interface TranslationResult {
  text: string;
  speechUri: string;
  confidence: number;
  emotion: string;
}

export default function SignLanguagePage() {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  
  const [translationState, setTranslationState] = useState<TranslationState>('idle');
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        setHasCameraPermission(true);
        setStream(stream);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this feature.',
        });
      }
    };

    getCameraPermission();
    
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
    
    // Use a supported MIME type, like video/mp4, if available
    const options = { mimeType: 'video/mp4' };
    try {
        mediaRecorderRef.current = new MediaRecorder(stream, options);
    } catch(e) {
        console.warn('video/mp4 not supported, falling back to default');
        mediaRecorderRef.current = new MediaRecorder(stream);
    }

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
    const mimeType = mediaRecorderRef.current?.mimeType || 'video/webm';
    const blob = new Blob(recordedChunksRef.current, { type: mimeType });
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = async () => {
      const base64data = reader.result as string;
      try {
        const res = await getSignLanguageTranslation({ videoDataUri: base64data });
        setResult({ text: res.translatedText, speechUri: res.translatedSpeechUri, confidence: res.confidenceScore, emotion: res.emotion });
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

  const EmotionIndicator = ({ emotion }: { emotion: string }) => {
    const lowerEmotion = emotion.toLowerCase();
    let icon = <Smile className="h-4 w-4" />;
    if (lowerEmotion.includes('question')) icon = <HelpCircle className="h-4 w-4" />;
    if (lowerEmotion.includes('urgent') || lowerEmotion.includes('sad') || lowerEmotion.includes('angry')) icon = <Frown className="h-4 w-4" />;

    return (
        <Badge variant="outline" className="flex items-center gap-2">
            {icon}
            <span>{emotion}</span>
        </Badge>
    );
  };

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
            {hasCameraPermission === false && (
              <div className="absolute flex flex-col items-center gap-2 text-muted-foreground">
                <CameraOff className="h-12 w-12" />
                <p>Camera access denied.</p>
              </div>
            )}
            {hasCameraPermission === null && (
               <div className="absolute flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p>Waiting for camera...</p>
              </div>
            )}
            {isRecording && <div className="absolute top-2 right-2 flex items-center gap-2 bg-destructive/80 text-destructive-foreground p-1 rounded-md text-xs"><Circle className="h-3 w-3 fill-current" />REC</div>}
          </div>
        </CardContent>
        <CardFooter>
          {!isRecording && !isProcessing && (
             <Button onClick={startRecording} disabled={!stream || !hasCameraPermission}>
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
                        <AlertTitle className="font-headline">Translation:</AlertTitle>
                        <AlertDescription className="mt-2 text-lg font-semibold">
                          {result.text}
                        </AlertDescription>
                    </Alert>

                     <div className="flex justify-between items-center gap-4">
                        <EmotionIndicator emotion={result.emotion} />
                        <div className="flex flex-col items-end">
                            <span className="text-sm font-medium">Confidence</span>
                            <Progress value={result.confidence * 100} className="w-24 h-2 mt-1" />
                            <span className="text-xs text-muted-foreground mt-1">{(result.confidence * 100).toFixed(0)}%</span>
                        </div>
                    </div>
                    
                    <Button onClick={() => playAudio(result.speechUri)} className="w-full">
                        <Volume2 className="mr-2 h-4 w-4" /> Listen to translation
                    </Button>

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
