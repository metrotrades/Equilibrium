
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, Button } from '../components/UIComponents';
import { geminiService } from '../services/geminiService';
import { Brain, Fingerprint, BarChart3, Download, UserX, ScrollText, Layers, EyeOff, GitCommit } from 'lucide-react';

export const Analysis: React.FC = () => {
  const { trades, profile, saveProfile } = useApp();
  
  const [secondOrder, setSecondOrder] = useState("");
  const [blindspots, setBlindspots] = useState<{missedSetups: string[], overlookedStrengths: string[]} | null>(null);
  const [loading, setLoading] = useState({ secondOrder: false, blindspots: false });

  // BE Bias Calculation
  const beTrades = trades.filter(t => t.result === 'BREAK_EVEN');
  const beBias = beTrades.length > 0 ? Math.floor((beTrades.length / trades.length) * 100) : 0;

  const runSecondOrder = async () => {
      setLoading(prev => ({...prev, secondOrder: true}));
      const res = await geminiService.analyzeSecondOrderEffects(trades);
      setSecondOrder(res);
      setLoading(prev => ({...prev, secondOrder: false}));
  };

  const runBlindspot = async () => {
      setLoading(prev => ({...prev, blindspots: true}));
      const res = await geminiService.detectBlindspots(trades);
      setBlindspots(res);
      setLoading(prev => ({...prev, blindspots: false}));
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end border-b border-white/5 pb-6">
         <div>
            <h2 className="text-xl font-light tracking-tight text-white">Analysis Lab</h2>
            <p className="text-[10px] font-mono text-gray-600 mt-1 uppercase tracking-widest">Deep Structural & Behavioral Intelligence</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Second-Order Effects */}
          <Card title="Second-Order Effects" subtitle="Domino Correlations" className="lg:col-span-2" hoverEffect rightElement={<Layers size={14} />}>
             {!secondOrder ? (
                 <div className="h-full flex flex-col items-center justify-center text-center py-8">
                     <p className="text-gray-500 text-xs font-mono mb-4">Analyze how one trade outcome influences the next.</p>
                     <Button onClick={runSecondOrder} isLoading={loading.secondOrder}>MAP CORRELATIONS</Button>
                 </div>
             ) : (
                 <div className="text-sm font-mono text-gray-300 leading-relaxed border-l-2 border-white/20 pl-4">
                     {secondOrder}
                 </div>
             )}
          </Card>

          {/* BE Bias */}
          <Card title="Break-Even Bias" subtitle="Fear Protection" hoverEffect rightElement={<GitCommit size={14} />}>
              <div className="flex flex-col items-center justify-center h-full py-4">
                  <div className="text-5xl font-light text-white mb-2">{beBias}%</div>
                  <div className="text-[10px] text-gray-500 uppercase">Of trades end BE</div>
                  <div className="w-full bg-gray-800 h-1 mt-4 rounded-full overflow-hidden">
                      <div className={`h-full ${beBias > 20 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.min(100, beBias * 3)}%` }} />
                  </div>
                  <div className="text-[9px] text-gray-600 mt-2">
                      {beBias > 20 ? 'HIGH FEAR DETECTED' : 'HEALTHY MANAGEMENT'}
                  </div>
              </div>
          </Card>
      </div>

      <div className="grid grid-cols-1 gap-8">
          {/* Blindspot Detector */}
          <Card title="Blindspot Detector" subtitle="What You Miss" hoverEffect rightElement={<EyeOff size={14} />}>
              {!blindspots ? (
                  <div className="text-center py-8">
                      <Button onClick={runBlindspot} isLoading={loading.blindspots}>REVEAL BLINDSPOTS</Button>
                  </div>
              ) : (
                  <div className="grid grid-cols-2 gap-8">
                      <div>
                          <div className="text-[10px] text-red-400 uppercase mb-2 border-b border-red-900/30 pb-1">Recurring Misses</div>
                          <ul className="list-disc list-inside space-y-2">
                              {blindspots.missedSetups.map((m, i) => (
                                  <li key={i} className="text-xs font-mono text-gray-400">{m}</li>
                              ))}
                          </ul>
                      </div>
                      <div>
                          <div className="text-[10px] text-blue-400 uppercase mb-2 border-b border-blue-900/30 pb-1">Overlooked Strengths</div>
                          <ul className="list-disc list-inside space-y-2">
                              {blindspots.overlookedStrengths.map((m, i) => (
                                  <li key={i} className="text-xs font-mono text-gray-400">{m}</li>
                              ))}
                          </ul>
                      </div>
                  </div>
              )}
          </Card>
      </div>
    </div>
  );
};
