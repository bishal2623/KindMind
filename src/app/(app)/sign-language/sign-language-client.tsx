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
import '@mediapipe/drawing_utils';
import { Camera as CameraIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    Hands: typeof Hands;
    HAND_CONNECTIONS: any;
    drawConnectors: (
      ctx: CanvasRenderingContext2D,
      landmarks: any,
      connections: any,
      options: any
    ) => void;
    drawLandmarks: (
      ctx: CanvasRenderingContext2D,
      landmarks: any,
      options: any
    ) => void;
  }
}

export default function SignLanguageClient() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handsRef = useRef<Hands | null>(null);
  const [outputMessage, setOutputMessage] = useState('Awaiting signs…');
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    isError: boolean;
  }>({ text: 'Camera not started', isError: false });
  const [isCameraOn, setIsCameraOn] = useState(false);

  // onResults callback for MediaPipe Hands
  const onResults = (results: Results) => {
    if (canvasRef.current && videoRef.current) {
      const canvasCtx = canvasRef.current.getContext('2d');
      if (!canvasCtx) return;

      const videoWidth = videoRef.current.videoWidth;
      const videoHeight = videoRef.current.videoHeight;
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;
      
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, videoWidth, videoHeight);

      // Flip the canvas horizontally for a mirror effect
      canvasCtx.translate(videoWidth, 0);
      canvasCtx.scale(-1, 1);
      
      // Draw the video frame
      canvasCtx.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        for (const landmarks of results.multiHandLandmarks) {
          window.drawConnectors(canvasCtx, landmarks, window.HAND_CONNECTIONS, {
            color: '#38bdf8',
            lineWidth: 3,
          });
          window.drawLandmarks(canvasCtx, landmarks, { color: '#e5e7eb', lineWidth: 2 });
        }
        if (outputMessage === 'Awaiting signs…' || outputMessage === 'Detecting hand signs 👋') {
          setOutputMessage('Hand detected 👋 (Translation in progress)');
        }
      } else {
         if (isCameraOn) {
            setOutputMessage('Detecting hand signs 👋');
         }
      }
      canvasCtx.restore();
    }
  };

  // Initialize MediaPipe Hands
  useEffect(() => {
    import('@mediapipe/hands').then(mpHands => {
      const hands = new mpHands.Hands({
        locateFile: file =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7,
      });

      hands.onResults(onResults);
      handsRef.current = hands;
    });

    if (
      location.protocol !== 'https:' &&
      location.hostname !== 'localhost'
    ) {
      setStatusMessage({
        text: '❌ Camera requires HTTPS or localhost. Please use a secure connection.',
        isError: true,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Function to start the camera and frame processing loop
  const startCamera = async () => {
    if (!videoRef.current || !handsRef.current) return;
    setStatusMessage({ text: 'Requesting camera permission…', isError: false });

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false,
      });

      videoRef.current.srcObject = stream;
      setIsCameraOn(true);
      setStatusMessage({ text: '✅ Camera started successfully', isError: false });
      setOutputMessage('Detecting hand signs 👋');
      
      const processFrame = async () => {
        if (videoRef.current && handsRef.current) {
          try {
             await handsRef.current.send({ image: videoRef.current });
          } catch(e) {
            console.error(e);
          }
        }
        requestAnimationFrame(processFrame);
      };
      
      videoRef.current.onloadedmetadata = () => {
         processFrame();
      };

    } catch (err: any) {
        let errorMessage = `❌ Camera error: ${err.message}`;
        if (err.name === 'NotAllowedError') {
            errorMessage = '❌ Camera permission denied. Click the 🔒 icon in the address bar and allow camera access.';
        } else if (err.name === 'NotFoundError') {
            errorMessage = '❌ No camera device found.';
        }
        setStatusMessage({ text: errorMessage, isError: true });
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            📷 Video Input
          </CardTitle>
          <CardDescription>Show hand signs in front of the camera.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col flex-1">
          <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform -scale-x-100 absolute"
              style={{ display: isCameraOn ? 'block' : 'none' }}
            ></video>
            <canvas
              ref={canvasRef}
              className="w-full h-full object-cover"
            ></canvas>
             {!isCameraOn && (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    Camera feed will appear here.
                </div>
            )}
          </div>
          {!isCameraOn && (
            <Button onClick={startCamera} className="mt-4 w-full">
              <CameraIcon className="mr-2 h-4 w-4" /> Start Camera
            </Button>
          )}
          <div className={cn(
            "status mt-3 text-center p-2.5 rounded-lg text-sm",
             statusMessage.isError ? 'bg-destructive/20 text-destructive' : 'bg-muted text-muted-foreground'
          )}>
              {statusMessage.text}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">📝 Translation Output</CardTitle>
          <CardDescription>
            The real-time analysis of your gestures appears here.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[340px] flex items-center justify-center text-center rounded-lg bg-[#020617]">
          <p className="text-2xl text-blue-300 animate-pulse">{outputMessage}</p>
        </CardContent>
      </Card>
    </div>
  );
}
