import React, { useState, useEffect, useRef } from 'react';
import { generateToken, getRemainingSeconds, formatTimeRemaining, clearToken, isTokenValid } from '../services/tokenManager';

export default function Dashboard({ tokenData: initialTokenData, onLogout }) {
    const [tokenInfo, setTokenInfo] = useState(initialTokenData);
    const [remaining, setRemaining] = useState(getRemainingSeconds());
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        // If no token data passed, generate one
        if (!tokenInfo) {
            const newToken = generateToken();
            setTokenInfo(newToken);
        }

        // Show content with a staggered animation
        setTimeout(() => setShowContent(true), 500);

        // Countdown interval
        const interval = setInterval(() => {
            const secs = getRemainingSeconds();
            setRemaining(secs);

            if (secs <= 0) {
                clearInterval(interval);
                clearToken();
                if (onLogout) onLogout();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        clearToken();
        if (onLogout) onLogout();
    };

    const urgency = remaining <= 60 ? 'critical' : remaining <= 120 ? 'warning' : 'normal';

    return (
        <div className="dashboard">
            <div className="dashboard-bg-effects">
                <div className="bg-orb bg-orb-1"></div>
                <div className="bg-orb bg-orb-2"></div>
            </div>

            <header className="dashboard-header">
                <div className="logo">
                    <div className="logo-icon success">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            <path d="M9 12l2 2 4-4" />
                        </svg>
                    </div>
                    <span className="logo-text">LiveGuard</span>
                    <span className="verified-badge">✓ Verified</span>
                </div>
                <div className="header-actions">
                    <button className="btn-reverify" onClick={handleLogout}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
                        </svg>
                        Re-verify
                    </button>
                    <button className="btn-logout" onClick={handleLogout}>Logout</button>
                </div>
            </header>

            {/* Token Status Bar */}
            <div className={`token-bar ${urgency}`}>
                <div className="token-info">
                    <span className="token-label">Access Token</span>
                    <code className="token-value">{tokenInfo?.token || '---'}</code>
                </div>
                <div className="token-timer">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                    </svg>
                    <span>Expires in: <strong>{formatTimeRemaining(remaining)}</strong></span>
                </div>
                <div className="token-progress-bar">
                    <div
                        className="token-progress-fill"
                        style={{ width: `${(remaining / 300) * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* Dashboard Content */}
            <div className={`dashboard-content ${showContent ? 'visible' : ''}`}>
                <h2 className="dash-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                    Secure Content Unlocked
                </h2>

                <div className="dash-grid">
                    <div className="dash-card card-wallet">
                        <div className="dash-card-icon">💰</div>
                        <h3>Crypto Wallet</h3>
                        <div className="dash-card-value">
                            <span className="currency">₿</span> 2.4851
                        </div>
                        <p className="dash-card-sub">≈ $142,893.27 USD</p>
                        <div className="dash-card-actions">
                            <button className="dash-btn">Send</button>
                            <button className="dash-btn">Receive</button>
                        </div>
                    </div>

                    <div className="dash-card card-files">
                        <div className="dash-card-icon">📁</div>
                        <h3>Secure Files</h3>
                        <ul className="file-list">
                            <li><span className="file-icon">📄</span> tax_return_2025.pdf <span className="file-badge">Encrypted</span></li>
                            <li><span className="file-icon">📄</span> passport_scan.jpg <span className="file-badge">Encrypted</span></li>
                            <li><span className="file-icon">📄</span> contract_final.docx <span className="file-badge">Encrypted</span></li>
                        </ul>
                    </div>

                    <div className="dash-card card-data">
                        <div className="dash-card-icon">📊</div>
                        <h3>Protected Data</h3>
                        <div className="data-stats">
                            <div className="data-stat">
                                <span className="data-stat-value">847</span>
                                <span className="data-stat-label">Records</span>
                            </div>
                            <div className="data-stat">
                                <span className="data-stat-value">23</span>
                                <span className="data-stat-label">Reports</span>
                            </div>
                            <div className="data-stat">
                                <span className="data-stat-value">99.7%</span>
                                <span className="data-stat-label">Uptime</span>
                            </div>
                        </div>
                    </div>

                    <div className="dash-card card-settings">
                        <div className="dash-card-icon">⚙️</div>
                        <h3>Security Settings</h3>
                        <div className="settings-list">
                            <label className="setting-row">
                                <span>Two-Factor Auth</span>
                                <span className="toggle active">ON</span>
                            </label>
                            <label className="setting-row">
                                <span>Biometric Lock</span>
                                <span className="toggle active">ON</span>
                            </label>
                            <label className="setting-row">
                                <span>Auto-Logout</span>
                                <span className="toggle active">5 min</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Security Footer */}
            <footer className="dashboard-footer">
                <div className="security-indicators">
                    <span className="sec-badge"><span className="sec-dot green"></span> TLS Encrypted</span>
                    <span className="sec-badge"><span className="sec-dot green"></span> Session Active</span>
                    <span className="sec-badge"><span className="sec-dot green"></span> Anti-Replay Verified</span>
                </div>
            </footer>
        </div>
    );
}
