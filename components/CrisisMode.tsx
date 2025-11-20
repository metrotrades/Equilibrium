
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Lock, Activity, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from './UIComponents';

export const CrisisMode: React.FC = () => {
    const { crisisMode } = useApp();
    const [countdown, setCountdown] = useState(60); // 1 minute cool-off mandatory
    
    useEffect(() => {
        if (crisisMode && countdown > 0) {
            const timer = setInterval(() => setCountdown(c => c - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [crisisMode, countdown]);

    if (!crisisMode) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-red-950/90 backdrop-blur-md flex flex-col items-center justify-center p-8 animate-fade-in">
            <div className="max-w-2xl w-full text-center space-y-8 border border-red-500/30 p-12 bg-black/50 rounded-[2px] shadow-[0_0_100px_rgba(255,0,0,0.3)]">
                <div className="flex flex-col items-center gap-4">
                    <AlertTriangle size={64} className="text-red-500 animate-pulse" />
                    <h1 className="text-4xl font-bold text-red-500 tracking-tighter uppercase">Crisis Protocol Active</h1>
                </div>
                
                <div className="text-xl font-mono text-white leading-relaxed">
                    "You are currently emotionally compromised. Trading is disabled to protect capital."
                </div>

                <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
                    <div className="bg-red-900/20 p-4 border border-red-900/50 text-red-400 text-xs font-mono uppercase tracking-widest">
                        PFC Shutdown Detected
                    </div>
                    <div className="bg-red-900/20 p-4 border border-red-900/50 text-red-400 text-xs font-mono uppercase tracking-widest">
                        Cortisol Spike
                    </div>
                    <div className="bg-red-900/20 p-4 border border-red-900/50 text-red-400 text-xs font-mono uppercase tracking-widest">
                        Logic Offline
                    </div>
                </div>

                <div className="py-8">
                    <div className="text-[10px] text-gray-400 uppercase tracking-[0.5em] mb-4">Mandatory Cooldown</div>
                    <div className="text-6xl font-mono text-white font-light">
                        00:{countdown.toString().padStart(2, '0')}
                    </div>
                </div>

                <div className="space-y-4">
                    <p className="text-sm text-gray-300">Perform 4-7-8 Breathing immediately.</p>
                    <Button disabled={countdown > 0} variant="outline" className="border-red-500 text-red-500 hover:bg-red-950">
                        {countdown > 0 ? "SYSTEM LOCKED" : "I AM GROUNDED. RESUME."}
                    </Button>
                </div>
            </div>
        </div>
    );
};
