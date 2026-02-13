import React, { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Challenge, Results } from '../types';
import { detectLiveness } from '../services/detectionService';
import { VERIFICATION_TIMEOUT_MS } from '../constants';

// Declare global FaceMesh since it's loaded via script tag
declare global {
  interface Window {
    FaceMesh: any;
  }
}

interface CameraViewProps {
  challenge: Challenge;
  onSuccess: (score: number) => void;
  onFail: () => void;
}

const CameraView: React.FC<CameraViewProps> = ({ challenge, onSuccess, onFail }) => {
  const webcamRef = useRef<Webcam>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(VERIFICATION_TIMEOUT_MS / 1000);
  const [feedback, setFeedback] = useState<string>("Align your face");
  
  // Scoring state
  const scoreAccumulator = useRef<number>(0);
  const successFrames = useRef<number>(0);
  const requiredSuccessFrames = 10; // Need consistent gesture for ~10 frames

  // Timer logic
  useEffect(() => {
    if (!modelLoaded) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onFail();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [modelLoaded, onFail]);

  // MediaPipe Setup
  const onResults = useCallback((results: Results) => {
    if (!modelLoaded) setModelLoaded(true);

    const { detected, score } = detectLiveness(results, challenge.type);

    if (detected) {
      successFrames.current += 1;
      scoreAccumulator.current += score;
      setFeedback("Hold it...");
      setProgress((successFrames.current / requiredSuccessFrames) * 100);

      if (successFrames.current >= requiredSuccessFrames) {
         const finalScore = scoreAccumulator.current / successFrames.current;
         onSuccess(finalScore);
      }
    } else {
      // Decay progress if gesture lost
      successFrames.current = Math.max(0, successFrames.current - 1);
      setProgress((successFrames.current / requiredSuccessFrames) * 100);
      setFeedback(successFrames.current > 0 ? "Keep going..." : "Looking for face...");
    }
  }, [challenge.type, modelLoaded, onSuccess]);

  useEffect(() => {
    if (!window.FaceMesh) {
      console.error("FaceMesh script not loaded");
      return;
    }

    const faceMesh = new window.FaceMesh({
      locateFile: (file: string) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
      },
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults(onResults);

    let animationFrameId: number;
    let isCancelled = false;

    // Manual video processing loop
    const processVideo = async () => {
      if (isCancelled) return;

      if (
        webcamRef.current &&
        webcamRef.current.video &&
        webcamRef.current.video.readyState === 4
      ) {
        try {
          await faceMesh.send({ image: webcamRef.current.video });
        } catch (error) {
          console.error("FaceMesh processing error:", error);
        }
      }

      if (!isCancelled) {
        animationFrameId = requestAnimationFrame(processVideo);
      }
    };

    // Start loop
    processVideo();

    return () => {
      isCancelled = true;
      cancelAnimationFrame(animationFrameId);
      faceMesh.close();
    };
  }, [onResults]);

  return (
    <div className="relative w-full max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-black">
      {/* Video Feed */}
      <Webcam
        ref={webcamRef}
        audio={false}
        className="w-full h-auto transform scale-x-[-1]" // Mirror effect
        width={640}
        height={480}
        screenshotFormat="image/jpeg"
        videoConstraints={{
          width: 640,
          height: 480,
          facingMode: "user"
        }}
      />

      {/* Overlay UI */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
        {/* Top Bar: Timer & Status */}
        <div className="flex justify-between items-center">
          <div className={`px-4 py-2 rounded-full font-bold backdrop-blur-md ${timeLeft < 5 ? 'bg-red-500/80' : 'bg-slate-800/80'} transition-colors duration-300`}>
            ⏱️ {timeLeft}s
          </div>
          <div className="px-4 py-2 bg-blue-600/80 backdrop-blur-md rounded-full text-sm font-semibold">
            Target: {challenge.instruction}
          </div>
        </div>

        {/* Center: Face Guide (Optional SVG overlay) */}
        {!modelLoaded && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                 <div className="animate-pulse text-xl font-semibold text-blue-400">Initializing Biometrics...</div>
             </div>
        )}

        {/* Bottom: Progress & Feedback */}
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white drop-shadow-lg">{challenge.icon}</h2>
            <p className="text-lg font-medium text-blue-200 drop-shadow-md">{feedback}</p>
          </div>
          
          <div className="w-full bg-slate-700/50 rounded-full h-4 backdrop-blur-sm overflow-hidden border border-slate-500/30">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-400 h-full transition-all duration-200 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid Overlay for "Tech" feel */}
      <div className="absolute inset-0 border-[20px] border-transparent pointer-events-none" 
           style={{ 
             background: 'linear-gradient(to right, rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(59, 130, 246, 0.1) 1px, transparent 1px)',
             backgroundSize: '40px 40px',
             maskImage: 'radial-gradient(circle, transparent 40%, black 100%)'
           }}>
      </div>
    </div>
  );
};

export default CameraView;