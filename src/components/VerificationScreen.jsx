import React, { useState, useCallback, useRef, useEffect } from 'react';
import CameraView from './CameraView';
import ChallengeDisplay from './ChallengeDisplay';
import Timer from './Timer';
import ConfidenceScore from './ConfidenceScore';
import { generateChallenge } from '../services/challengeGenerator';
import { matchChallenge } from '../services/livenessDetection';
import { calculateScore } from '../services/scoring';
import { validateChallenge } from '../services/antiReplay';

/**
 * Verification flow states:
 *  init       → Camera starting up, models loading
 *  challenge  → Challenge displayed, timer counting, detecting
 *  analyzing  → Detection complete, computing scores
 *  results    → Showing confidence scores and verdict
 */
export default function VerificationScreen({ onComplete, onBack }) {
    const [phase, setPhase] = useState('init');
    const [challenge, setChallenge] = useState(null);
    const [results, setResults] = useState(null);
    const [detectionActive, setDetectionActive] = useState(false);

    // Track challenge completion
    const challengeMetRef = useRef(false);
    const blinkCountRef = useRef(0);
    const prevEyeStateRef = useRef(false);
    const movementDetectedRef = useRef(false);
    const bestConfidenceRef = useRef(0);
    // Guard against double-invocation of finishVerification
    const isFinishingRef = useRef(false);
    // Ref to always have the latest challenge (avoids stale closures)
    const challengeRef = useRef(null);

    // Start challenge after camera is ready
    useEffect(() => {
        const timer = setTimeout(() => {
            if (phase === 'init') {
                const newChallenge = generateChallenge();
                setChallenge(newChallenge);
                challengeRef.current = newChallenge;
                setPhase('challenge');
                setDetectionActive(true);
                isFinishingRef.current = false;
            }
        }, 2000);
        return () => clearTimeout(timer);
    }, [phase]);

    const handleDetection = useCallback((detection) => {
        if (phase !== 'challenge' || !challengeRef.current) return;

        if (detection.faceDetected) {
            movementDetectedRef.current = true;
            const currentChallenge = challengeRef.current;

            // Special handling for blink counting
            if (currentChallenge.type === 'blink') {
                if (detection.eyesClosed && !prevEyeStateRef.current) {
                    blinkCountRef.current += 1;
                }
                prevEyeStateRef.current = detection.eyesClosed;

                if (blinkCountRef.current >= 2) {
                    challengeMetRef.current = true;
                    bestConfidenceRef.current = 0.92;
                }
            } else {
                const match = matchChallenge(currentChallenge.type, detection);
                if (match.matched) {
                    challengeMetRef.current = true;
                    bestConfidenceRef.current = Math.max(bestConfidenceRef.current, match.confidence);
                }
            }

            // Auto-complete when challenge is met
            if (challengeMetRef.current && !isFinishingRef.current) {
                setTimeout(() => finishVerification(), 800);
            }
        }
    }, [phase]);

    const finishVerification = useCallback(() => {
        // Guard: prevent double invocation
        if (isFinishingRef.current) return;
        isFinishingRef.current = true;

        setDetectionActive(false);
        setPhase('analyzing');

        const currentChallenge = challengeRef.current;

        // Validate anti-replay
        const replayResult = validateChallenge(currentChallenge);

        // Calculate score
        const score = calculateScore({
            faceDetected: true,
            challengeMatched: challengeMetRef.current,
            movementDetected: movementDetectedRef.current,
            expressionConfidence: bestConfidenceRef.current || 0.5
        });

        // Anti-replay info (shown but doesn't block score)
        score.replayValid = replayResult.valid;

        setTimeout(() => {
            setResults(score);
            setPhase('results');
        }, 1500);
    }, []);

    const handleTimeout = useCallback(() => {
        finishVerification();
    }, [finishVerification]);

    const handleResultContinue = () => {
        if (results?.passed) {
            onComplete(results);
        } else {
            // Reset everything for retry
            challengeMetRef.current = false;
            blinkCountRef.current = 0;
            prevEyeStateRef.current = false;
            movementDetectedRef.current = false;
            bestConfidenceRef.current = 0;
            isFinishingRef.current = false;
            challengeRef.current = null;
            setResults(null);
            setChallenge(null);
            setPhase('init');
        }
    };

    return (
        <div className="verification-screen">
            <header className="verify-header">
                <button className="back-btn" onClick={onBack}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>
                <div className="verify-step-indicator">
                    <span className={`step ${phase !== 'init' ? 'done' : 'active'}`}>1. Camera</span>
                    <span className={`step ${phase === 'challenge' ? 'active' : phase === 'analyzing' || phase === 'results' ? 'done' : ''}`}>2. Challenge</span>
                    <span className={`step ${phase === 'analyzing' ? 'active' : phase === 'results' ? 'done' : ''}`}>3. Analyze</span>
                    <span className={`step ${phase === 'results' ? 'active' : ''}`}>4. Result</span>
                </div>
            </header>

            <div className="verify-body">
                <div className="verify-camera-section">
                    <CameraView onDetection={handleDetection} active={detectionActive} />
                </div>

                <div className="verify-side-panel">
                    {phase === 'init' && (
                        <div className="phase-init">
                            <div className="spinner large"></div>
                            <h3>Preparing Verification</h3>
                            <p>Loading camera and AI models...</p>
                        </div>
                    )}

                    {phase === 'challenge' && challenge && (
                        <div className="phase-challenge">
                            <ChallengeDisplay challenge={challenge} />
                            <Timer duration={10} onTimeout={handleTimeout} active={true} />
                            <div className="detection-status">
                                <div className={`det-indicator ${movementDetectedRef.current ? 'active' : ''}`}>
                                    <span className="det-dot"></span> Face Tracking
                                </div>
                                {challenge.type === 'blink' && (
                                    <div className="blink-counter">
                                        Blinks: {blinkCountRef.current} / 2
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {phase === 'analyzing' && (
                        <div className="phase-analyzing">
                            <div className="analyzing-animation">
                                <div className="scan-line"></div>
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.5">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                            </div>
                            <h3>Analyzing Results</h3>
                            <p>Validating liveness & anti-replay checks...</p>
                        </div>
                    )}

                    {phase === 'results' && (
                        <ConfidenceScore results={results} onContinue={handleResultContinue} />
                    )}
                </div>
            </div>
        </div>
    );
}
