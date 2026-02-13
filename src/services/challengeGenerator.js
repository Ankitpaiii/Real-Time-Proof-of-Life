import { v4 as uuidv4 } from 'uuid';

const CHALLENGES = [
  {
    type: 'blink',
    instruction: 'Blink twice',
    icon: '👁️',
    description: 'Close and open your eyes twice'
  },
  {
    type: 'smile',
    instruction: 'Smile widely',
    icon: '😄',
    description: 'Show a big, genuine smile'
  },
  {
    type: 'turnLeft',
    instruction: 'Turn head left',
    icon: '👈',
    description: 'Slowly turn your head to the left'
  },
  {
    type: 'turnRight',
    instruction: 'Turn head right',
    icon: '👉',
    description: 'Slowly turn your head to the right'
  },
  {
    type: 'nod',
    instruction: 'Nod your head',
    icon: '👇',
    description: 'Nod your head up and down'
  },
  {
    type: 'raiseEyebrows',
    instruction: 'Raise eyebrows',
    icon: '😲',
    description: 'Raise both eyebrows high'
  }
];

export function generateChallenge() {
  const randomIndex = Math.floor(Math.random() * CHALLENGES.length);
  const challenge = CHALLENGES[randomIndex];

  return {
    id: uuidv4(),
    ...challenge,
    timestamp: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30000).toISOString() // 30 second window
  };
}

export function getChallengeTypes() {
  return CHALLENGES.map(c => c.type);
}
