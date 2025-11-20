
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { geminiService } from '../services/geminiService';
import { Button, Card, Badge, ProgressBar } from '../components/UIComponents';
import { Brain, AlertTriangle, Activity, Microscope, Zap, Fingerprint, Search } from 'lucide-react';
import { NeuroPatternReport } from '../types';

export const Psychology: React.FC = () => {
  const { trades, psychFingerprint } = useApp();
  const [neuroReport, setNeuroReport] = useState<NeuroPatternReport | null>(null);
  const [loadingNeuro, setLoadingNeuro] = useState(false);

  const runNeuroScan = async () => {
      setLoadingNeuro(true);
      const res = await geminiService.analyzeNeuroPatterns(trades.slice(0, 20));
      setNeuroReport(res);
      setLoadingNeuro(false);
  };

  return (
    <div className="space-y-8 relative animate-fade-in">
      <div className="flex justify-between items-end border-b border-white/5 pb-6">
         <div>
            <h2 className="text-xl font-light tracking-tight text-white">Psychometrics</h2>
            <p className="text-[10px] font-mono text-gray-600 mt-1 uppercase tracking-widest">Cognitive Bias Map & Emotional Baseline</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {/* Mental Fingerprint */}
         <Card title="Real-Time Fingerprint" subtitle="Current Psych State" className="md:col-span-1" hoverEffect rightElement={<Fingerprint size={14} />}>
             <div className="space-y-4">
                 <div>
                     <div className="flex justify-between text-[9px] text-gray-500 uppercase mb-1">Volatility</div>
                     <ProgressBar value={psychFingerprint.volatility} max={100} color="bg-red-500" />
                 </div>
                 <div>
                     <div className="flex justify-between text-[9px] text-gray-500 uppercase mb-1">Clarity</div>
                     <ProgressBar value={psychFingerprint.clarity} max={100} color="bg-blue-500" />
                 </div>
                 <div>
                     <div className="flex justify-between text-[9px] text-gray-500 uppercase mb-1">Discipline</div>
                     <ProgressBar value={psychFingerprint.discipline} max={100} color="bg-green-500" />
                 </div>
                 <div className="text-center pt-4">
                     <span className="text-[10px] font-mono text-gray-400">STATE: {psychFingerprint.volatility > 60 ? 'UNSTABLE' : 'OPTIMAL'}</span>
                 </div>
             </div>
         </Card>

         {/* Neuro-Pattern Engine */}
         <Card title="Neuro-Pattern Engine" subtitle="Subconscious Analysis" className="md:col-span-2" hoverEffect rightElement={<Brain size={14} />}>
             {!neuroReport ? (
                 <div className="h-full flex flex-col items-center justify-center text-center py-8">
                     <p className="text-gray-500 text-xs font-mono mb-4">Scan trade logs for thought loops and emotional spirals.</p>
                     <Button onClick={runNeuroScan} isLoading={loadingNeuro}>INITIATE NEURO SCAN</Button>
                 </div>
             ) : (
                 <div className="grid grid-cols-2 gap-6">
                     <div>
                         <div className="text-[10px] text-red-400 uppercase mb-2">Thought Loops (Negative)</div>
                         <ul className="space-y-2">
                             {neuroReport.thoughtLoops.map((loop, i) => (
                                 <li key={i} className="text-xs font-mono text-gray-400 flex items-center gap-2">
                                     <Activity size={10} /> "{loop}"
                                 </li>
                             ))}
                         </ul>
                     </div>
                     <div>
                         <div className="text-[10px] text-amber-400 uppercase mb-2">Emotional Spirals</div>
                         <ul className="space-y-2">
                             {neuroReport.emotionalSpirals.map((spiral, i) => (
                                 <li key={i} className="text-xs font-mono text-gray-400 flex items-center gap-2">
                                     <Zap size={10} /> {spiral}
                                 </li>
                             ))}
                         </ul>
                     </div>
                 </div>
             )}
         </Card>
      </div>
      
      {/* Discipline Metronome */}
      <Card title="Discipline Metronome" subtitle="Behavioral Rhythm" className="min-h-[150px]" rightElement={<Activity size={14}/>}>
          <div className="flex items-center justify-center h-24 gap-1">
              {/* Visualizing discipline consistency over last 20 trades */}
              {trades.slice(0, 30).map((t, i) => (
                  <div 
                    key={i} 
                    className={`w-2 rounded-sm transition-all duration-300 ${t.discipline >= 4 ? 'bg-green-500 h-12' : t.discipline === 3 ? 'bg-gray-600 h-8' : 'bg-red-500 h-6'}`} 
                    title={`Discipline: ${t.discipline}`}
                  />
              ))}
              {trades.length === 0 && <span className="text-xs text-gray-600 font-mono">NO DATA</span>}
          </div>
      </Card>
    </div>
  );
};
