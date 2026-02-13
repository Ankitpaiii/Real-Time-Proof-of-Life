/**
 * Anti-Replay Protection Service
 * 
 * Prevents reuse of verification sessions by:
 * - Tracking used challenge IDs
 * - Validating timestamp freshness (< 30 seconds)
 * - Rejecting duplicate submissions
 */

const usedChallengeIds = new Set();

export function validateChallenge(challenge) {
    const errors = [];

    // Check if challenge ID was already used
    if (usedChallengeIds.has(challenge.id)) {
        errors.push('Challenge ID already used — replay detected');
    }

    // Check timestamp freshness (must be within 30 seconds)
    const challengeTime = new Date(challenge.timestamp).getTime();
    const now = Date.now();
    const ageSeconds = (now - challengeTime) / 1000;

    if (ageSeconds > 30) {
        errors.push(`Challenge expired — ${Math.round(ageSeconds)}s old (max 30s)`);
    }

    if (ageSeconds < 0) {
        errors.push('Invalid timestamp — future date detected');
    }

    const isValid = errors.length === 0;

    // Mark challenge as used if valid
    if (isValid) {
        usedChallengeIds.add(challenge.id);
    }

    return {
        valid: isValid,
        errors,
        challengeId: challenge.id,
        ageSeconds: Math.round(ageSeconds),
        checkedAt: new Date().toISOString()
    };
}

export function getUsedChallengeCount() {
    return usedChallengeIds.size;
}

export function clearUsedChallenges() {
    usedChallengeIds.clear();
}
