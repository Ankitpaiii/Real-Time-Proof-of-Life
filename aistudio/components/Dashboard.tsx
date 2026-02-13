import React, { useEffect, useState } from 'react';
import { AuthToken } from '../types';
import { clearToken } from '../services/authService';

interface DashboardProps {
  token: AuthToken;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ token, onLogout }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = token.expiresAt - Date.now();
      if (remaining <= 0) {
        onLogout();
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [token, onLogout]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-black text-gray-200 p-4 md:p-8 font-mono">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-gray-800 pb-6">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <div className="w-12 h-12 bg-emerald-900/30 border border-emerald-500/50 rounded flex items-center justify-center">
            <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-white tracking-tighter">THE VAULT</h1>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <p className="text-emerald-500 text-xs tracking-widest uppercase">Secure Connection Est.</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right hidden md:block">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Session Termination</p>
            <p className="text-xl font-bold text-emerald-400">{formatTime(timeLeft)}</p>
          </div>
          <button 
            onClick={() => { clearToken(); onLogout(); }}
            className="border border-red-900/50 hover:bg-red-900/20 text-red-500 px-6 py-2 text-sm uppercase tracking-widest transition"
          >
            Disconnect
          </button>
        </div>
      </header>

      {/* Content Grid */}
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Token NFT Card */}
        <div className="col-span-1 lg:col-span-3 bg-gray-900/50 border border-gray-800 p-8 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
             <div>
               <h3 className="text-emerald-500 text-sm uppercase tracking-widest mb-1">Proof of Life Token (ERC-721)</h3>
               <div className="font-mono text-2xl md:text-4xl text-white tracking-widest mb-4">{token.token}</div>
               <div className="flex flex-col gap-1">
                 <div className="text-xs text-gray-500">TRANSACTION HASH</div>
                 <div className="text-xs text-gray-400 break-all">{token.txHash}</div>
               </div>
             </div>
             <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xs text-gray-500 uppercase">Status</div>
                  <div className="text-emerald-400 font-bold">MINTED & VERIFIED</div>
                </div>
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full border border-emerald-500/30 flex items-center justify-center">
                   <span className="text-2xl">🧬</span>
                </div>
             </div>
          </div>
        </div>

        {/* Secure Asset 1 */}
        <div className="bg-black border border-gray-800 p-6 hover:border-emerald-500/50 transition duration-300">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 bg-gray-900 flex items-center justify-center text-gray-400 border border-gray-700">
             ₿
            </div>
            <span className="text-[10px] bg-gray-900 text-gray-400 px-2 py-1 uppercase">Cold Storage</span>
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Crypto Wallet</h3>
          <p className="text-gray-500 text-xs mb-4">Multi-sig authorization required.</p>
          <div className="text-2xl font-mono text-white">42.069 BTC</div>
          <div className="mt-4 h-1 w-full bg-gray-800">
            <div className="h-full bg-emerald-500 w-3/4"></div>
          </div>
        </div>

        {/* Secure Asset 2 */}
        <div className="bg-black border border-gray-800 p-6 hover:border-emerald-500/50 transition duration-300">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 bg-gray-900 flex items-center justify-center text-gray-400 border border-gray-700">
             📄
            </div>
            <span className="text-[10px] bg-red-900/20 text-red-500 px-2 py-1 uppercase border border-red-900/30">Top Secret</span>
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Project Titan</h3>
          <p className="text-gray-500 text-xs mb-4">Blueprints and schematics.</p>
          <ul className="space-y-3">
            <li className="flex items-center justify-between text-xs text-gray-400 border-b border-gray-800 pb-2">
              <span>specs_v4.pdf</span>
              <span className="text-emerald-500">Unlocked</span>
            </li>
            <li className="flex items-center justify-between text-xs text-gray-400 border-b border-gray-800 pb-2">
              <span>network_map.json</span>
              <span className="text-emerald-500">Unlocked</span>
            </li>
          </ul>
        </div>

        {/* Log */}
        <div className="bg-black border border-gray-800 p-6 hover:border-emerald-500/50 transition duration-300">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 bg-gray-900 flex items-center justify-center text-gray-400 border border-gray-700">
             ⚙️
            </div>
            <span className="text-[10px] bg-gray-900 text-gray-400 px-2 py-1 uppercase">Audit Log</span>
          </div>
          <h3 className="text-lg font-bold text-white mb-1">System Access</h3>
          <div className="mt-4 space-y-2 font-mono text-[10px] text-gray-500">
            <p>&gt; Identity Verified (Biometric)</p>
            <p>&gt; Token Minted: Block #192482</p>
            <p>&gt; Session started: {new Date().toLocaleTimeString()}</p>
            <p className="animate-pulse text-emerald-500">&gt; Connection secure...</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;