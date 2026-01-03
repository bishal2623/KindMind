'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Hands, Results, HAND_CONNECTIONS } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { Camera as CameraIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function SignLanguageClient() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [outputMessage, setOutputMessage] = useState('Awaiting signs…');
  const [isCameraStarted, setIsCameraStarted] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isCameraStarted && hasCameraPermission) {
      const hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7,
      });

      hands.onResults(onResults);

      if (videoRef.current) {
        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current) {
              await hands.send({ image: videoRef.current });
            }
          },
          width: 640,
          height: 360,
        });
        camera.start();

        return () => {
          camera.stop();
          hands.close();
        };
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCameraStarted, hasCameraPermission]);

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
          drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
            color: '#38bdf8',
            lineWidth: 3,
          });
          drawLandmarks(canvasCtx, landmarks, { color: '#e5e7eb', lineWidth: 2 });
        }
        setOutputMessage('Hand detected 👋 (Translation in progress)');
      } else {
        setOutputMessage('Awaiting signs…');
      }
      canvasCtx.restore();
    }
  }

  const handleStartCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasCameraPermission(true);
      setIsCameraStarted(true);

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
                      Please allow camera access to start.
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
