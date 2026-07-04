import React, { useState } from 'react';
import { Swords, Shield, Zap, Activity, Trophy, Play } from 'lucide-react';

export default function App() {
  const [isBattling, setIsBattling] = useState(false);
  const [epoch, setEpoch] = useState(0);
  
  // State for both agents
  const [agentA, setAgentA] = useState({ power: 0, winProb: 0.5 });
  const [agentB, setAgentB] = useState({ power: 0, winProb: 0.5 });

  const startArenaBattle = () => {
    setIsBattling(true);
    setEpoch(0);
    setAgentA({ power: 0, winProb: 0.5 });
    setAgentB({ power: 0, winProb: 0.5 });

    // 1. Dial the new Arena WebSocket channel (UPDATED TO LOCALHOST)
    const ws = new WebSocket("ws://localhost:8000/arena-stream");

    // 2. Listen to the live fight
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // Inject live battle telemetry
      setEpoch(data.epoch);
      setAgentA({ power: data.power_a, winProb: data.win_prob_a });
      setAgentB({ power: data.power_b, winProb: data.win_prob_b });
    };

    ws.onerror = (error) => {
      console.error("WebSocket Error:", error);
      alert("Arena Stream failed! Is the FastAPI server running?");
      setIsBattling(false);
    };

    ws.onclose = () => {
      setIsBattling(false);
    };
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans selection:bg-cyan-900">
      
      {/* Header */}
      <header className="mb-10 flex items-center justify-between border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 bg-clip-text text-transparent flex items-center gap-3">
            <Swords size={32} className="text-purple-400" />
            The Reinforcement Arena
          </h1>
          <p className="text-slate-400 mt-2">Multi-Agent Quantum Adversarial Simulation</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={startArenaBattle}
            disabled={isBattling}
            className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all ${
              isBattling 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
            }`}
          >
            {isBattling ? <><Activity size={20} className="animate-spin" /> Simulating...</> : <><Play size={20} /> Start Battle</>}
          </button>
        </div>
      </header>

      {/* Epoch Tracker */}
      <div className="mb-8 bg-slate-900 p-4 rounded-xl border border-slate-800 text-center shadow-lg">
        <p className="text-sm text-slate-400 uppercase tracking-widest mb-2">Round / Epoch</p>
        <p className="text-3xl font-mono text-white">[{epoch.toString().padStart(3, '0')} / 100]</p>
        <div className="w-full bg-slate-950 rounded-full h-2 border border-slate-800 mt-4 overflow-hidden">
          <div 
            className="bg-purple-500 h-2 transition-all duration-75"
            style={{ width: `${(epoch / 100) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Arena Split Screen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Agent A (Aggro Red) */}
        <div className="bg-gradient-to-b from-red-950/50 to-slate-900 rounded-2xl p-8 border border-red-900/50 shadow-[0_0_30px_rgba(220,38,38,0.1)] relative overflow-hidden">
          {agentA.winProb > agentB.winProb && !isBattling && epoch === 100 && (
            <Trophy size={48} className="absolute top-4 right-4 text-yellow-500 opacity-20" />
          )}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-red-500/20 rounded-lg text-red-400">
              <Zap size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-red-400">Agent A</h2>
              <p className="text-red-500/70 text-sm font-mono">Aggro Topology</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-slate-400 text-sm mb-2">Raw Power Output</p>
              <p className="text-4xl font-mono text-white">{agentA.power.toFixed(4)}</p>
            </div>
            
            <div className="pt-6 border-t border-red-900/30">
              <div className="flex justify-between items-end mb-2">
                <p className="text-slate-400 text-sm">Win Probability</p>
                <p className={`text-3xl font-bold font-mono ${agentA.winProb > 0.5 ? 'text-green-400' : 'text-slate-300'}`}>
                  {(agentA.winProb * 100).toFixed(1)}%
                </p>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-4 overflow-hidden border border-slate-800">
                <div 
                  className="bg-red-500 h-4 transition-all duration-100 ease-linear"
                  style={{ width: `${agentA.winProb * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Agent B (Control Blue) */}
        <div className="bg-gradient-to-b from-blue-950/50 to-slate-900 rounded-2xl p-8 border border-blue-900/50 shadow-[0_0_30px_rgba(37,99,235,0.1)] relative overflow-hidden">
          {agentB.winProb > agentA.winProb && !isBattling && epoch === 100 && (
            <Trophy size={48} className="absolute top-4 right-4 text-yellow-500 opacity-20" />
          )}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
              <Shield size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-blue-400">Agent B</h2>
              <p className="text-blue-500/70 text-sm font-mono">Control / Counter-Meta</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-slate-400 text-sm mb-2">Raw Power Output</p>
              <p className="text-4xl font-mono text-white">{agentB.power.toFixed(4)}</p>
            </div>
            
            <div className="pt-6 border-t border-blue-900/30">
              <div className="flex justify-between items-end mb-2">
                <p className="text-slate-400 text-sm">Win Probability</p>
                <p className={`text-3xl font-bold font-mono ${agentB.winProb > 0.5 ? 'text-green-400' : 'text-slate-300'}`}>
                  {(agentB.winProb * 100).toFixed(1)}%
                </p>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-4 overflow-hidden border border-slate-800 flex justify-end">
                <div 
                  className="bg-blue-500 h-4 transition-all duration-100 ease-linear"
                  style={{ width: `${agentB.winProb * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}