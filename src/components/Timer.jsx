import React, { useState, useEffect, useRef } from 'react';

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function Timer({ duration = 10, onTimeout, active = true }) {
    const [timeLeft, setTimeLeft] = useState(duration);
    const intervalRef = useRef(null);
    const onTimeoutRef = useRef(onTimeout);
    const hasFiredRef = useRef(false);

    // Keep callback ref fresh without restarting the interval
    useEffect(() => {
        onTimeoutRef.current = onTimeout;
    }, [onTimeout]);

    useEffect(() => {
        if (!active) return;

        setTimeLeft(duration);
        hasFiredRef.current = false;

        intervalRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current);
                    if (!hasFiredRef.current) {
                        hasFiredRef.current = true;
                        if (onTimeoutRef.current) onTimeoutRef.current();
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [duration, active]);

    const progress = timeLeft / duration;
    const dashOffset = CIRCUMFERENCE * (1 - progress);

    // Color transitions: green → yellow → orange → red
    const getColor = () => {
        if (progress > 0.6) return '#10b981';
        if (progress > 0.3) return '#f59e0b';
        return '#ef4444';
    };

    const isPulsing = timeLeft <= 3 && timeLeft > 0;

    return (
        <div className={`timer-container ${isPulsing ? 'timer-pulse' : ''}`}>
            <svg className="timer-svg" width="130" height="130" viewBox="0 0 130 130">
                {/* Background ring */}
                <circle
                    cx="65" cy="65" r={RADIUS}
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="8"
                />
                {/* Progress ring */}
                <circle
                    cx="65" cy="65" r={RADIUS}
                    fill="none"
                    stroke={getColor()}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={dashOffset}
                    transform="rotate(-90 65 65)"
                    className="timer-progress"
                />
                {/* Time text */}
                <text
                    x="65" y="60"
                    textAnchor="middle"
                    fill={getColor()}
                    fontSize="36"
                    fontWeight="700"
                    fontFamily="'Inter', monospace"
                >
                    {timeLeft}
                </text>
                <text
                    x="65" y="82"
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.5)"
                    fontSize="11"
                    fontFamily="'Inter', sans-serif"
                >
                    seconds
                </text>
            </svg>
        </div>
    );
}
