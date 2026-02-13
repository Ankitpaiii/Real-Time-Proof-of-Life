import { Point, ChallengeType, Results } from '../types';

// Helper to calculate Euclidean distance
const distance = (p1: Point, p2: Point) => {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};

export const detectLiveness = (results: Results, currentChallenge: ChallengeType): { detected: boolean; score: number } => {
  if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
    return { detected: false, score: 0 };
  }

  const landmarks = results.multiFaceLandmarks[0];

  // Key Landmarks (approximate indices for MediaPipe FaceMesh)
  // Eyes
  const leftEyeTop = landmarks[159];
  const leftEyeBottom = landmarks[145];
  const rightEyeTop = landmarks[386];
  const rightEyeBottom = landmarks[374];
  
  // Mouth
  const mouthLeft = landmarks[61];
  const mouthRight = landmarks[291];
  const upperLip = landmarks[13];
  const lowerLip = landmarks[14];

  // Face width (for normalization)
  const leftCheek = landmarks[234];
  const rightCheek = landmarks[454];
  const faceWidth = distance(leftCheek, rightCheek);

  // Nose (for head turn)
  const noseTip = landmarks[1];

  let detected = false;
  let score = 0; // 0 to 100 confidence for this frame

  switch (currentChallenge) {
    case 'BLINK':
      // Calculate Eye Aspect Ratio (EAR)
      // Small EAR means eye is closed
      const leftEyeHeight = distance(leftEyeTop, leftEyeBottom);
      const rightEyeHeight = distance(rightEyeTop, rightEyeBottom);
      const avgEyeHeight = (leftEyeHeight + rightEyeHeight) / 2;
      const eyeRatio = avgEyeHeight / faceWidth;

      // Threshold: typical open eye is ~0.06-0.08 relative to face width, closed is < 0.03
      if (eyeRatio < 0.025) {
        detected = true;
        score = 95;
      } else {
        score = 10;
      }
      break;

    case 'SMILE':
      // Calculate mouth width and openess
      const mouthWidth = distance(mouthLeft, mouthRight);
      const mouthRatio = mouthWidth / faceWidth;
      
      // Threshold: Resting ~0.45, Smiling > 0.55
      if (mouthRatio > 0.50) {
        detected = true;
        score = Math.min(100, (mouthRatio - 0.45) * 1000); 
      }
      break;

    case 'TURN_LEFT':
      // Compare nose X to cheek X. 
      // 0 is left image edge, 1 is right image edge.
      // If looking left (user's left), nose moves closer to rightCheek in the mirrored image 
      // BUT MediaPipe coordinates: x increases left to right.
      // Let's use relative position of nose between cheeks.
      const noseRelX = (noseTip.x - leftCheek.x) / (rightCheek.x - leftCheek.x);
      
      // Center is approx 0.5. Looking left (user's left) means nose moves towards user's left cheek (landmark 234, small x)
      // So noseRelX should decrease.
      if (noseRelX < 0.35) {
        detected = true;
        score = (0.4 - noseRelX) * 200; // Scale up
      }
      break;

    case 'TURN_RIGHT':
       // Nose moves towards user's right cheek (landmark 454, large x)
       const noseRelXRight = (noseTip.x - leftCheek.x) / (rightCheek.x - leftCheek.x);
       if (noseRelXRight > 0.65) {
         detected = true;
         score = (noseRelXRight - 0.6) * 200;
       }
      break;
  }

  return { detected, score: Math.min(100, Math.max(0, score)) };
};