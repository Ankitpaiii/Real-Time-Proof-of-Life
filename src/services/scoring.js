/**
 * Scoring system for liveness verification.
 * 
 * Scoring breakdown:
 *  - Face detected:       +30 points
 *  - Challenge action:    +40 points  
 *  - Movement/liveness:   +30 points
 * 
 * Pass threshold: >= 70
 */

export function calculateScore(detectionResults) {
    const { faceDetected, challengeMatched, movementDetected, expressionConfidence } = detectionResults;

    let livenessScore = 0;
    let expressionMatch = 0;

    // Face detection component (30 pts)
    if (faceDetected) {
        livenessScore += 30;
    }

    // Challenge action match (40 pts)
    if (challengeMatched) {
        expressionMatch = Math.min(100, Math.round((expressionConfidence || 0.85) * 100));
        livenessScore += Math.round(40 * (expressionConfidence || 0.85));
    }

    // Movement / liveness component (30 pts)
    if (movementDetected) {
        livenessScore += 30;
    }

    const passed = livenessScore >= 70;

    return {
        livenessScore: Math.min(100, livenessScore),
        expressionMatch,
        movementDetected: !!movementDetected,
        challengeSuccess: passed ? 'PASSED' : 'FAILED',
        passed,
        timestamp: new Date().toISOString()
    };
}

export const PASS_THRESHOLD = 70;
