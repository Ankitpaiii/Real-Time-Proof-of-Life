import { Challenge } from './types';

export const CHALLENGES: Challenge[] = [
  {
    id: 'bio_blink_test',
    type: 'BLINK',
    instruction: 'Initiate Blink Sequence (x2)',
    icon: '👁️',
    threshold: 0.25, 
  },
  {
    id: 'bio_sentiment_test',
    type: 'SMILE',
    instruction: 'Verify Positive Sentiment (Smile)',
    icon: '😊',
    threshold: 0.5, 
  },
  {
    id: 'bio_motor_left',
    type: 'TURN_LEFT',
    instruction: 'Rotate Head: Axis Left',
    icon: '⬅️',
    threshold: -10, 
  },
  {
    id: 'bio_motor_right',
    type: 'TURN_RIGHT',
    instruction: 'Rotate Head: Axis Right',
    icon: '➡️',
    threshold: 10, 
  },
];

export const VERIFICATION_TIMEOUT_MS = 10000; 
export const TOKEN_EXPIRY_MS = 5 * 60 * 1000; 
export const PASS_SCORE_THRESHOLD = 70;