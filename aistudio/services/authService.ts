import { AuthToken } from '../types';
import { TOKEN_EXPIRY_MS } from '../constants';

const STORAGE_KEY = 'the_vault_token';

// Simple mock for unique ID
const generateHex = (length: number) => {
  return [...Array(length)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
};

export const generateToken = (): AuthToken => {
  const token: AuthToken = {
    token: `POL-${generateHex(8).toUpperCase()}`, // Proof Of Life
    txHash: `0x${generateHex(64)}`,
    expiresAt: Date.now() + TOKEN_EXPIRY_MS,
    scopes: ['access:vault', 'read:wallet']
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(token));
  return token;
};

export const getStoredToken = (): AuthToken | null => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  
  try {
    const token: AuthToken = JSON.parse(stored);
    if (Date.now() > token.expiresAt) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return token;
  } catch (e) {
    return null;
  }
};

export const clearToken = () => {
  localStorage.removeItem(STORAGE_KEY);
};