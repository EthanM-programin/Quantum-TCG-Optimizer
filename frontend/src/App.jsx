import React, { useState, useEffect } from 'react';
import { Cpu, Zap, Layers, Play, CheckCircle2, Activity } from 'lucide-react';

const mockCardDatabase = [
  { id: "OP01-001", name: "Roronoa Zoro", type: "Leader", cost: 0, power: 5000, color: "bg-red-900" },
  { id: "OP01-025", name: "Roronoa Zoro", type: "Character", cost: 3, power: 5000, color: "bg-red-800" },
  { id: "OP01-016", name: "Nami", type: "Character", cost: 1, power: 2000, color: "bg-orange-600" },
  { id: "OP01-004", name: "Sanji", type: "Character", cost: 2, power: 4000, color: "bg-yellow-700" },
];

export default function App() {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const [metrics, setMetrics] = useState({ score: 0.0, loss: 1.0 });
  const [quantumAngles, setQuantumAngles] = useState([0, 0, 0, 0]);

  // Simulate the Python Hybrid Loop
  useEffect(() => {
    let interval;
    if(isOptimizing && epoch < 49) {
      interval = setInterval(() => {
        setEpoch(prev => prev + 1);
      }, 100); // Speed of simulation
    }
    return () => clearInterval(interval);
  }, [isOptimizing, epoch]);

  // Real API Call
  const handleStart = async () => {
    setIsOptimizing(true);
    setIsComplete(false);
    setEpoch(0);
    setMetrics({ score: 0.0, loss: 1.0 });
    setQuantumAngles([0, 0, 0, 0]);

    try {
      // 1. Send request to FastAPI server
      const response = await fetch("http://127.0.0.1:8000/optimize");
      const data = await response.json();

      // 2. Inject the real Python results into your React UI.
      setMetrics({ score: data.synergy_score, loss: data.loss });
      setQuantumAngles(data.final_angles);

      // 3. Snap the progress bar to 100% and show the deck
      setEpoch(50);
      setIsOptimizing(false);
      setIsComplete(true);

    } catch(error) {
      console.error("API Connection Error:", error);
      alert("Failed to connect to Python backend, is the server running?")
      setIsOptimizing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans selection:bg-cyan-900">

      {/* Header */}
      <header className="mb-10 flex items-center justify-between border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent flex items-center gap-3">
            <Zap size={32} className="text-cyan-400" />
            Quantum TCG Optimizer
          </h1>
          <p className="text-slate-400 mt-2">Hybrid PennyLane-PyTorch Synergy Engine</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-lg border border-slate-800">
            <div className={`w-3 h-3 rounded-full ${isOptimizing ? 'bg-yellow-400 animate-pulse' : 'bg-cyan-500'}`}></div>
            <span className="text-sm text-slate-300 font-mono">
              {isOptimizing ? 'QPU ACTIVE' : 'SYSTEM IDLE'}
            </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Controls & Terminal */}
        <div className="lg:col-span-1 space-y-6">

          {/* Control Panel */}
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-2xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Cpu size={20} className="text-blue-400" />
              Optimization Control
            </h2>

            <button
              onClick={handleStart}
              disabled={isOptimizing}
              className={`w-full py-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                isOptimizing
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(8,145,178,0.5)]'
              }`}
            >
              {isOptimizing ? (
                <><Activity size={20} className="animate-spin" /> Training Model...</>
              ) : (
                <><Play size={20} /> Initialize Hybrid Loop</>
              )}
            </button>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm text-slate-400 mb-2 font-mono">
                <span>Epoch Progress</span>
                <span>[{epoch.toString().padStart(2, '0')}/50]</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-3 border border-slate-800 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-400 h-3 transition-all duration-100"
                  style={{ width: `${(epoch / 50) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Telemetry Display (Simulated Terminal) */}
          <div className="bg-black rounded-xl p-6 border border-slate-800 font-mono shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>
            <h2 className="text-sm text-slate-500 mb-4 uppercase tracking-wider">Live Telemetry</h2>

            <div className="space-y-4">
              <div>
                <p className="text-slate-400 text-xs mb-1">AI Synergy Score</p>
                <p className="text-2xl text-green-400">{metrics.score.toFixed(4)}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">Mean Squared Error (Loss)</p>
                <p className="text-2xl text-red-400">{metrics.loss.toFixed(4)}</p>
              </div>
              <div className="pt-4 border-t border-slate-800">
                <p className="text-slate-400 text-xs mb-2">Qubit Rotation Angles (0)</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-cyan-200">
                  {quantumAngles.map((angle, i) => (
                    <div key={i} className="bg-slate-900 p-2 rounded">
                      Q{i}: {angle.toFixed(4)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Deck Display */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 h-full shadow-2xl min-h-[500px] flex flex-col">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Layers size={20} className="text-purple-400" />
              Quantum Optimized Deck State
            </h2>

            {!isComplete && !isOptimizing && (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                <Layers size={48} className="mb-4 opacity-20" />
                <p>System awaiting initialization.</p>
                <p className="text-sm">Click "Initialize Hybrid Loop" to begin.</p>
              </div>
            )}

            {isOptimizing && (
              <div className="flex-1 flex flex-col items-center justify-center text-cyan-500">
                <Activity size={48} className="mb-4 animate-bounce" />
                <p className="animate-pulse font-mono">Superposition state active. Evaluating permutations...</p>
              </div>
            )}

            {isComplete && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 h-full">
                <div className="bg-green-900/20 border border-green-500/30 text-green-400 p-4 rounded-lg mb-6 flex items-center gap-3">
                  <CheckCircle2 size={24} />
                  <div>
                    <p className="font-bold">Optimization Complete</p>
                    <p className="text-sm text-green-200/70">Quantum circuit successfully converged on high-synergy meta pattern.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {mockCardDatabase.map((card, i) => (
                    <div
                      key={i}
                      className={`${card.color} rounded-xl p-4 shadow-lg border border-white/10 relative overflow-hidden hover:scale-105 transition-transform cursor-pointer group`}
                    >
                      <div className="absolute top-0 right-0 p-2 opacity-50 font-mono text-xs">
                        {card.id}
                      </div>
                      <div className="mt-8">
                        <span className="text-xs font-bold uppercase tracking-wider text-white/70">{card.type}</span>
                        <h3 className="text-lg font-black text-white leading-tight mt-1">{card.name}</h3>
                      </div>
                      <div className="mt-4 flex justify-between items-center bg-black/30 p-2 rounded text-sm">
                        <span className="font-mono font-bold">Cost: {card.cost}</span>
                        <span className="font-mono font-bold text-yellow-300">Power: {card.power}</span>
                      </div>

                      {/* Holographic shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}