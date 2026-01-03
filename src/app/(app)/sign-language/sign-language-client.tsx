'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { type Hands, type Results } from '@mediapipe/hands';
import '@mediapipe/camera_utils';
import '@mediapipe/drawing_utils';
import { Camera as CameraIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

declare global {
    interface Window {
        Camera: any;
        Hands: typeof Hands;
        HAND_CONNECTIONS: any;
        drawConnectors: (ctx: CanvasRenderingContext2D, landmarks: any, connections: any, options: any) => void;
        drawLandmarks: (ctx: CanvasRenderingContext2D, landmarks: any, options: any) => void;
    }
}

export default function SignLanguageClient() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [outputMessage, setOutputMessage] = useState('Awaiting signs…');
  const [isCameraStarted, setIsCameraStarted] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(true);
  const { toast } = useToast();
  const handsRef = useRef<Hands | null>(null);

  useEffect(() => {
    // Dynamically import Hands to ensure it runs client-side
    import('@mediapipe/hands').then((mpHands) => {
        handsRef.current = new mpHands.Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });
        
        handsRef.current.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.7,
        });

        handsRef.current.onResults(onResults);
    });
    
    return () => {
      handsRef.current?.close();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  function onResults(results: Results) {
    if (canvasRef.current && videoRef.current) {
      const canvasCtx = canvasRef.current.getContext('2d');
      if (!canvasCtx) return;

      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      // Set canvas dimensions to match video
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        for (const landmarks of results.multiHandLandmarks) {
          window.drawConnectors(canvasCtx, landmarks, window.HAND_CONNECTIONS, {
            color: '#38bdf8',
            lineWidth: 3,
          });
          window.drawLandmarks(canvasCtx, landmarks, { color: '#e5e7eb', lineWidth: 2 });
        }
        setOutputMessage('Hand detected 👋 (Translation in progress)');
      } else {
        setOutputMessage('Awaiting signs…');
      }
      canvasCtx.restore();
    }
  }

  const handleStartCamera = async () => {
    if (!videoRef.current || !handsRef.current) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setHasCameraPermission(true);
      
      const camera = new window.Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current) {
            await handsRef.current!.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 360,
      });

      camera.start();
      setIsCameraStarted(true);

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

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">📷 Video Input</CardTitle>
          <CardDescription>Show hand signs in front of the camera.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100"></video>
            <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full transform -scale-x-100"></canvas>
            {!isCameraStarted && !hasCameraPermission && (
               <div className="absolute inset-0 flex items-center justify-center">
                  <Alert variant="destructive" className="w-auto">
                    <AlertTitle>Camera Access Required</AlertTitle>
                    <AlertDescription>
                      Click "Start Camera" and allow access.
                    </AlertDescription>
                  </Alert>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          {!isCameraStarted && (
            <Button onClick={handleStartCamera}>
              <CameraIcon className="mr-2 h-4 w-4" /> Start Camera
            </Button>
          )}
        </CardFooter>
      </Card>
      
      <Card>
         <CardHeader>
            <CardTitle className="font-headline">📝 Translation Output</CardTitle>
            <CardDescription>The detected landmarks will be shown here.</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[340px] flex items-center justify-center text-center rounded-lg bg-muted">
           <p className="text-2xl text-blue-300">
             {outputMessage}
           </p>
        </CardContent>
      </Card>
    </div>
  );
}
