import React, { useState, useEffect } from 'react';

export default function ConfidenceScore({ results, onContinue }) {
    const [animatedLiveness, setAnimatedLiveness] = useState(0);
    const [animatedExpression, setAnimatedExpression] = useState(0);
    const [showVerdict, setShowVerdict] = useState(false);

    useEffect(() => {
        if (!results) return;

        // Animate scores counting up
        let frame = 0;
        const totalFrames = 40;
        const interval = setInterval(() => {
            frame++;
            const pct = frame / totalFrames;
            const eased = 1 - Math.pow(1 - pct, 3); // ease-out cubic
            setAnimatedLiveness(Math.round(results.livenessScore * eased));
            setAnimatedExpression(Math.round(results.expressionMatch * eased));

            if (frame >= totalFrames) {
                clearInterval(interval);
                setTimeout(() => setShowVerdict(true), 300);
            }
        }, 30);

        return () => clearInterval(interval);
    }, [results]);

    if (!results) return null;

    return (
        <div className="confidence-score">
            <h2 className="results-title">Verification Results</h2>

            <div className="score-cards">
                <div className="score-card">
                    <div className="score-label">Liveness Score</div>
                    <div className="score-bar-container">
                        <div
                            className="score-bar"
                            style={{
                                width: `${animatedLiveness}%`,
                                background: animatedLiveness >= 70
                                    ? 'linear-gradient(90deg, #10b981, #34d399)'
                                    : 'linear-gradient(90deg, #ef4444, #f87171)'
                            }}
                        ></div>
                    </div>
                    <div className="score-value">{animatedLiveness}%</div>
                </div>

                <div className="score-card">
                    <div className="score-label">Expression Match</div>
                    <div className="score-bar-container">
                        <div
                            className="score-bar"
                            style={{
                                width: `${animatedExpression}%`,
                                background: 'linear-gradient(90deg, #6366f1, #818cf8)'
                            }}
                        ></div>
                    </div>
                    <div className="score-value">{animatedExpression}%</div>
                </div>

                <div className="score-card score-card-row">
                    <div className="score-label">Movement Detected</div>
                    <div className={`score-badge ${results.movementDetected ? 'success' : 'fail'}`}>
                        {results.movementDetected ? '✓ YES' : '✗ NO'}
                    </div>
                </div>

                <div className="score-card score-card-row">
                    <div className="score-label">Challenge Success</div>
                    <div className={`score-badge ${results.passed ? 'success' : 'fail'}`}>
                        {results.challengeSuccess}
                    </div>
                </div>
            </div>

            {showVerdict && (
                <div className={`verdict ${results.passed ? 'verdict-pass' : 'verdict-fail'}`}>
                    <div className="verdict-icon">
                        {results.passed ? (
                            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M8 12l3 3 5-5" />
                            </svg>
                        ) : (
                            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="15" y1="9" x2="9" y2="15" />
                                <line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                        )}
                    </div>
                    <h3 className="verdict-text">
                        {results.passed ? 'IDENTITY VERIFIED' : 'VERIFICATION FAILED'}
                    </h3>
                    <p className="verdict-sub">
                        {results.passed
                            ? 'Proof of life confirmed. Generating secure access token...'
                            : 'Could not verify liveness. Please try again with better lighting.'}
                    </p>
                    <button className="verdict-btn" onClick={onContinue}>
                        {results.passed ? 'Access Dashboard →' : 'Retry Verification'}
                    </button>
                </div>
            )}
        </div>
    );
}
