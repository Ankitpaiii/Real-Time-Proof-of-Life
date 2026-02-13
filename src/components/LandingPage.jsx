import React from 'react';

export default function LandingPage({ onStart }) {
    return (
        <div className="landing-page">
            <div className="landing-bg-effects">
                <div className="bg-orb bg-orb-1"></div>
                <div className="bg-orb bg-orb-2"></div>
                <div className="bg-orb bg-orb-3"></div>
            </div>

            <header className="landing-header">
                <div className="logo">
                    <div className="logo-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                    </div>
                    <span className="logo-text">LiveGuard</span>
                </div>
                <div className="header-badge">
                    <span className="badge-dot"></span>
                    Proof of Life Auth
                </div>
            </header>

            <main className="landing-hero">
                <div className="hero-content">
                    <div className="hero-shield-icon">
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="url(#shieldGrad)" strokeWidth="1.5">
                            <defs>
                                <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#818cf8" />
                                    <stop offset="100%" stopColor="#6366f1" />
                                </linearGradient>
                            </defs>
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            <path d="M9 12l2 2 4-4" stroke="#34d399" strokeWidth="2" />
                        </svg>
                    </div>

                    <h1 className="hero-title">
                        Real-Time <br />
                        <span className="gradient-text">Proof of Life</span><br />
                        Authentication
                    </h1>

                    <p className="hero-subtitle">
                        Verify you're a real human, present right now, through
                        unpredictable interactive challenges. Defeats photos,
                        video replays, and deepfakes.
                    </p>

                    <button className="start-btn" onClick={onStart}>
                        <span className="start-btn-icon">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                <path d="M9 12l2 2 4-4" />
                            </svg>
                        </span>
                        Start Verification
                        <span className="start-btn-arrow">→</span>
                    </button>

                    <p className="hero-note">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: 6 }}>
                            <rect x="3" y="11" width="18" height="11" rx="2" />
                            <path d="M7 11V7a5 5 0 0110 0v4" />
                        </svg>
                        Camera access required · No data stored · Single-use tokens
                    </p>
                </div>
            </main>

            <section className="features-section">
                <h2 className="features-title">What Attacks We Prevent</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">📸</div>
                        <h3>Photo Attacks</h3>
                        <p>Static images have no movement — our system detects real-time facial dynamics</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🎬</div>
                        <h3>Video Replays</h3>
                        <p>Random challenges can't be predicted — pre-recorded videos won't match</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🤖</div>
                        <h3>Deepfakes</h3>
                        <p>10-second window means no time to generate convincing real-time fakes</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🔒</div>
                        <h3>Session Hijacking</h3>
                        <p>Temporary tokens expire in 5 minutes — continuous re-verification required</p>
                    </div>
                </div>
            </section>

            <section className="tech-strip">
                <span>Built with</span>
                <span className="tech-tag">React</span>
                <span className="tech-tag">MediaPipe / face-api.js</span>
                <span className="tech-tag">WebRTC</span>
                <span className="tech-tag">UUID Tokens</span>
            </section>
        </div>
    );
}
