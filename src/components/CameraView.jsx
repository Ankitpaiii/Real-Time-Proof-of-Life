import React, { useRef, useEffect, useCallback, useState } from 'react';
import { loadModels, detectFace, drawDetections } from '../services/livenessDetection';

export default function CameraView({ onDetection, active }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const animFrameRef = useRef(null);
    const [cameraReady, setCameraReady] = useState(false);
    const [modelsReady, setModelsReady] = useState(false);
    const [error, setError] = useState(null);

    // Start camera
    useEffect(() => {
        let cancelled = false;

        async function initCamera() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
                });
                if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current.play();
                        setCameraReady(true);
                    };
                }
            } catch (err) {
                console.error('[LiveGuard] Camera error:', err);
                setError('Camera access denied. Please allow camera permissions.');
            }
        }

        async function initModels() {
            try {
                await loadModels();
                if (!cancelled) setModelsReady(true);
            } catch (err) {
                console.error('[LiveGuard] Model load error:', err);
                setError('Failed to load face detection models.');
            }
        }

        initCamera();
        initModels();

        return () => {
            cancelled = true;
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop());
            }
            if (animFrameRef.current) {
                cancelAnimationFrame(animFrameRef.current);
            }
        };
    }, []);

    // Detection loop
    const runDetection = useCallback(async () => {
        if (!active || !cameraReady || !modelsReady || !videoRef.current) return;

        const result = await detectFace(videoRef.current);

        if (result && canvasRef.current) {
            drawDetections(canvasRef.current, videoRef.current, result);
        }

        if (result && onDetection) {
            onDetection(result);
        }

        animFrameRef.current = requestAnimationFrame(() => {
            setTimeout(runDetection, 150); // ~6-7 FPS detection rate
        });
    }, [active, cameraReady, modelsReady, onDetection]);

    useEffect(() => {
        if (active && cameraReady && modelsReady) {
            runDetection();
        }
        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, [active, cameraReady, modelsReady, runDetection]);

    return (
        <div className="camera-view">
            {error ? (
                <div className="camera-error">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                    <p>{error}</p>
                </div>
            ) : (
                <>
                    <div className="camera-wrapper">
                        <video ref={videoRef} className="camera-video" autoPlay playsInline muted />
                        <canvas ref={canvasRef} className="camera-overlay" />
                        {(!cameraReady || !modelsReady) && (
                            <div className="camera-loading">
                                <div className="spinner"></div>
                                <p>{!cameraReady ? 'Starting camera...' : 'Loading AI models...'}</p>
                            </div>
                        )}
                        <div className="camera-border-anim"></div>
                    </div>
                    <div className="camera-status">
                        <span className={`status-dot ${cameraReady ? 'active' : ''}`}></span>
                        {cameraReady && modelsReady ? 'Camera Active · AI Ready' : 'Initializing...'}
                    </div>
                </>
            )}
        </div>
    );
}
