import React, { useState, useCallback } from 'react';
import LandingPage from './components/LandingPage';
import VerificationScreen from './components/VerificationScreen';
import Dashboard from './components/Dashboard';
import { generateToken, isTokenValid, clearToken } from './services/tokenManager';

/**
 * App state machine:
 *   landing → verifying → dashboard
 *   dashboard → landing (on logout / token expiry)
 *   verifying → landing (on back)
 */
export default function App() {
  const [screen, setScreen] = useState('landing');
  const [tokenData, setTokenData] = useState(null);

  const handleStartVerification = useCallback(() => {
    setScreen('verifying');
  }, []);

  const handleVerificationComplete = useCallback((results) => {
    if (results.passed) {
      const token = generateToken();
      setTokenData(token);
      setScreen('dashboard');
    }
  }, []);

  const handleBack = useCallback(() => {
    setScreen('landing');
  }, []);

  const handleLogout = useCallback(() => {
    clearToken();
    setTokenData(null);
    setScreen('landing');
  }, []);

  return (
    <div className="app">
      {screen === 'landing' && (
        <LandingPage onStart={handleStartVerification} />
      )}
      {screen === 'verifying' && (
        <VerificationScreen
          onComplete={handleVerificationComplete}
          onBack={handleBack}
        />
      )}
      {screen === 'dashboard' && (
        <Dashboard tokenData={tokenData} onLogout={handleLogout} />
      )}
    </div>
  );
}
