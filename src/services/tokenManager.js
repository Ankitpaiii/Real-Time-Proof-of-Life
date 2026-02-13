/**
 * Token Manager Service
 * 
 * Generates temporary proof-of-life tokens with 5-minute expiry.
 * Tokens are stored in sessionStorage for persistence across page state.
 */

import { v4 as uuidv4 } from 'uuid';

const TOKEN_KEY = 'liveguard_proof_token';
const TOKEN_EXPIRY_KEY = 'liveguard_token_expiry';
const TOKEN_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export function generateToken() {
    // Create a short, readable token prefix
    const uuid = uuidv4();
    const shortToken = uuid.substring(0, 6).toUpperCase();
    const fullToken = `ProofToken:${shortToken}`;

    const now = Date.now();
    const expiresAt = now + TOKEN_DURATION_MS;

    // Store in sessionStorage
    sessionStorage.setItem(TOKEN_KEY, fullToken);
    sessionStorage.setItem(TOKEN_EXPIRY_KEY, expiresAt.toString());

    return {
        token: fullToken,
        shortCode: shortToken,
        createdAt: new Date(now).toISOString(),
        expiresAt: new Date(expiresAt).toISOString(),
        expiresAtMs: expiresAt,
        validForSeconds: TOKEN_DURATION_MS / 1000
    };
}

export function getToken() {
    const token = sessionStorage.getItem(TOKEN_KEY);
    const expiresAt = sessionStorage.getItem(TOKEN_EXPIRY_KEY);

    if (!token || !expiresAt) return null;

    return {
        token,
        expiresAtMs: parseInt(expiresAt, 10)
    };
}

export function isTokenValid() {
    const tokenData = getToken();
    if (!tokenData) return false;
    return Date.now() < tokenData.expiresAtMs;
}

export function getRemainingSeconds() {
    const tokenData = getToken();
    if (!tokenData) return 0;
    const remaining = Math.max(0, tokenData.expiresAtMs - Date.now());
    return Math.ceil(remaining / 1000);
}

export function clearToken() {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_EXPIRY_KEY);
}

export function formatTimeRemaining(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
