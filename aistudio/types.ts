export type ChallengeType = 'BLINK' | 'SMILE' | 'TURN_LEFT' | 'TURN_RIGHT';

export interface Challenge {
  id: string;
  type: ChallengeType;
  instruction: string;
  icon: string;
  threshold: number; 
}

export interface VerificationResult {
  isLive: boolean;
  score: number;
  message: string;
  timestamp: string;
}

export interface AuthToken {
  token: string;
  txHash: string; // Simulated Blockchain Transaction Hash
  expiresAt: number;
  scopes: string[];
}

export type AppState = 'LANDING' | 'VERIFYING' | 'ANALYZING' | 'MINTING' | 'SUCCESS' | 'FAILED' | 'DASHBOARD';

export interface Point {
  x: number;
  y: number;
  z: number;
}

export interface Results {
  multiFaceLandmarks: Point[][];
  image: any;
}