import React, { useState, useEffect, useCallback } from 'react';
import { AppState, Challenge, VerificationResult, AuthToken } from './types';
import { CHALLENGES } from './constants';
import { generateToken, getStoredToken } from './services/authService';
import CameraView from './components/CameraView';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>('LANDING');
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [token, setToken] = useState<AuthToken | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const storedToken = getStoredToken();
    if (storedToken) {
      setToken(storedToken);
      setState('DASHBOARD');
    }
  }, []);

  const startVerification = () => {
    // 1. Pick random challenge
    const randomChallenge = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];
    setCurrentChallenge(randomChallenge);
    setState('VERIFYING');
    setResult(null);
  };

  const handleSuccess = useCallback((score: number) => {
    setState('ANALYZING'); 
    
    // Simulate complex analysis then minting
    setTimeout(() => {
      setState('MINTING');
      
      setTimeout(() => {
        const newToken = generateToken();
        setToken(newToken);
        setResult({
          isLive: true,
          score: Math.round(score),
          message: 'Proof of Life Confirmed',
          timestamp: new Date().toISOString()
        });
        setState('SUCCESS');
      }, 2500); // Fake minting time
    }, 1500); // Fake analysis time
  }, []);

  const handleFail = useCallback(() => {
    setResult({
      isLive: false,
      score: 0,
      message: 'Liveness Check Failed',
      timestamp: new Date().toISOString()
    });
    setState('FAILED');
  }, []);

  const enterDashboard = () => {
    setState('DASHBOARD');
  };

  // --- RENDER HELPERS ---

  if (state === 'DASHBOARD' && token) {
    return <Dashboard token={token} onLogout={() => setState('LANDING')} />;
  }

  return (
    <div className="min-h-screen bg-black text-gray-100 flex flex-col items-center justify-center p-4 relative overflow-hidden font-display selection:bg-emerald-500 selection:text-black">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 opacity-20" 
           style={{ 
             backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)',
             backgroundSize: '40px 40px'
           }}>
      </div>
      
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="z-10 w-full max-w-4xl relative">
        
        {/* LANDING STATE */}
        {state === 'LANDING' && (
          <div className="text-center space-y-8 animate-fade-in pt-10">
            <div className="inline-block border border-emerald-500/30 p-6 rounded-full bg-black/50 backdrop-blur-sm mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
               <svg className="w-16 h-16 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-white">
              THE VAULT
            </h1>
            <p className="text-xl md:text-2xl text-emerald-500/80 font-mono tracking-widest uppercase">
              Anti-Deepfake Identity Protocol
            </p>
            <p className="text-gray-400 max-w-xl mx-auto text-lg leading-relaxed">
              "Proof of life in a synthetic world." <br/>
              Authenticate your humanity to mint a temporary access token on-chain.
            </p>
            
            <div className="flex flex-col md:flex-row justify-center gap-6 py-10">
               <div className="border border-gray-800 bg-gray-900/50 p-4 w-full md:w-48 text-left">
                 <div className="text-emerald-500 mb-2">01</div>
                 <div className="font-bold text-white">Liveness Check</div>
                 <div className="text-xs text-gray-500">Biometric Verification</div>
               </div>
               <div className="border border-gray-800 bg-gray-900/50 p-4 w-full md:w-48 text-left">
                 <div className="text-emerald-500 mb-2">02</div>
                 <div className="font-bold text-white">Sentiment Analysis</div>
                 <div className="text-xs text-gray-500">Emotion Authenticity</div>
               </div>
               <div className="border border-gray-800 bg-gray-900/50 p-4 w-full md:w-48 text-left">
                 <div className="text-emerald-500 mb-2">03</div>
                 <div className="font-bold text-white">Token Minting</div>
                 <div className="text-xs text-gray-500">On-Chain Proof</div>
               </div>
            </div>

            <button
              onClick={startVerification}
              className="group relative inline-flex items-center justify-center px-10 py-4 font-bold text-black transition-all duration-200 bg-emerald-500 hover:bg-emerald-400 rounded-none uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_40px_rgba(16,185,129,0.6)]"
            >
              Initialize Sequence
            </button>
          </div>
        )}

        {/* VERIFYING STATE */}
        {state === 'VERIFYING' && currentChallenge && (
          <div className="w-full flex flex-col items-center animate-fade-in">
             <div className="mb-8 text-center">
                <div className="inline-block px-3 py-1 border border-emerald-500/50 text-emerald-500 text-xs uppercase tracking-widest mb-4">Live Session Active</div>
                <h2 className="text-3xl font-bold text-white mb-2">Proof of Life Required</h2>
                <p className="text-gray-400">Execute the following biometric challenge.</p>
             </div>
             
             <CameraView 
               challenge={currentChallenge} 
               onSuccess={handleSuccess} 
               onFail={handleFail} 
             />

             <div className="mt-8 flex items-center gap-2 text-xs text-emerald-500/70 font-mono">
               <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
               NET_SECURE // ENCRYPTED_CHANNEL
             </div>
          </div>
        )}

        {/* ANALYZING STATE */}
        {state === 'ANALYZING' && (
          <div className="flex flex-col items-center justify-center h-96">
            <div className="relative w-24 h-24 mb-8">
               <div className="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
               <div className="absolute inset-0 border-4 border-t-emerald-500 rounded-full animate-spin"></div>
            </div>
            <h2 className="text-2xl font-bold text-white uppercase tracking-widest animate-pulse">Analyzing Biometrics</h2>
            <div className="mt-4 font-mono text-emerald-500 text-sm space-y-1 text-center">
              <p>Scanning facial landmarks...</p>
              <p>Verifying micro-expressions...</p>
              <p>Detecting deepfake artifacts...</p>
            </div>
          </div>
        )}

        {/* MINTING STATE */}
        {state === 'MINTING' && (
          <div className="flex flex-col items-center justify-center h-96">
             <div className="w-24 h-24 mb-8 flex items-center justify-center text-4xl animate-bounce">
               ⛓️
             </div>
             <h2 className="text-2xl font-bold text-white uppercase tracking-widest">Minting Proof Token</h2>
             <p className="text-gray-500 mt-2 font-mono text-sm">Interacting with Smart Contract...</p>
             
             <div className="w-64 h-1 bg-gray-800 mt-8 overflow-hidden">
               <div className="h-full bg-emerald-500 w-full animate-[loading_2s_ease-in-out_infinite] origin-left"></div>
             </div>
             
             <div className="mt-4 font-mono text-xs text-gray-600">
               GAS: 14 Gwei | EST: &lt; 5s
             </div>
          </div>
        )}

        {/* SUCCESS STATE */}
        {state === 'SUCCESS' && result && (
           <div className="max-w-md mx-auto bg-black border border-emerald-500/50 p-10 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 shadow-[0_0_15px_#10b981]"></div>
              
              <div className="w-20 h-20 bg-emerald-900/20 border border-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 text-emerald-500">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              
              <h2 className="text-2xl font-bold text-white uppercase tracking-widest mb-2">Access Granted</h2>
              <p className="text-gray-500 text-sm mb-8 font-mono">Proof of Life Token Successfully Minted</p>
              
              <div className="bg-gray-900 border border-gray-800 p-6 mb-8 text-left font-mono text-sm">
                 <div className="flex justify-between mb-2">
                   <span className="text-gray-500">LIVENESS</span>
                   <span className="text-emerald-500">{result.score}% CONFIDENCE</span>
                 </div>
                 <div className="flex justify-between mb-2">
                   <span className="text-gray-500">SENTIMENT</span>
                   <span className="text-emerald-500">AUTHENTIC</span>
                 </div>
                 <div className="flex justify-between mb-2">
                   <span className="text-gray-500">TOKEN ID</span>
                   <span className="text-white truncate w-24">{token?.token}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-gray-500">TX HASH</span>
                   <span className="text-gray-400 truncate w-24">{token?.txHash.substring(0, 10)}...</span>
                 </div>
              </div>

              <button onClick={enterDashboard} className="w-full bg-white text-black font-bold py-4 hover:bg-gray-200 transition uppercase tracking-widest">
                Enter The Vault
              </button>
           </div>
        )}

        {/* FAILED STATE */}
        {state === 'FAILED' && (
           <div className="max-w-md mx-auto bg-black border border-red-500/50 p-10 text-center relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500 shadow-[0_0_15px_#ef4444]"></div>
              
              <div className="w-20 h-20 bg-red-900/20 border border-red-500 rounded-full flex items-center justify-center mx-auto mb-8 text-red-500">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </div>
              
              <h2 className="text-2xl font-bold text-white uppercase tracking-widest mb-2">Access Denied</h2>
              <p className="text-gray-500 text-sm mb-8 font-mono">Verification Failed: Spoof Detected or Timeout</p>
              
              <div className="bg-red-900/10 border border-red-900/50 p-4 mb-8 text-xs text-red-400 font-mono text-left">
                ERR_CODE: LIVENESS_CHECK_FAILED<br/>
                Suggestion: Ensure adequate lighting and perform gesture within time limit.
              </div>

              <button onClick={() => setState('LANDING')} className="w-full border border-gray-700 text-white font-bold py-4 hover:bg-gray-900 transition uppercase tracking-widest">
                Restart Protocol
              </button>
           </div>
        )}

      </div>
    </div>
  );
};

export default App;