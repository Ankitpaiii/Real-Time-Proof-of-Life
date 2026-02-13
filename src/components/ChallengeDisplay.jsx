import React from 'react';

export default function ChallengeDisplay({ challenge }) {
    if (!challenge) return null;

    return (
        <div className="challenge-display">
            <div className="challenge-label">YOUR CHALLENGE</div>
            <div className="challenge-card">
                <span className="challenge-icon">{challenge.icon}</span>
                <h2 className="challenge-instruction">{challenge.instruction}</h2>
                <p className="challenge-description">{challenge.description}</p>
            </div>
            <div className="challenge-id">
                Challenge ID: <code>{challenge.id.substring(0, 8)}...</code>
            </div>
        </div>
    );
}
