
import React from 'react';
import { useApp } from '../context/AppContext';
import { RiskStatus } from '../types';
import { ShieldAlert, ShieldCheck, AlertTriangle, Lock, Activity, Zap } from 'lucide-react';

export const RiskGuardrail: React.FC = () => {
    const { dailyRisk, profile, mentalBandwidth, crisisMode } = useApp();
    
    const getStatusColor = () => {
        if (crisisMode) return 'border-red-500 bg-red-950/80 animate-pulse';
        switch(dailyRisk.status) {
            case RiskStatus.SAFE: return 'border-green-900/30 bg-green-950/10';
            case RiskStatus.CAUTION: return 'border-amber-900/30 bg-amber-950/10';
            case RiskStatus.DANGER: return 'border-red-900/30 bg-red-950/10';
            case RiskStatus.LOCKED: return 'border-red-600 bg-red-950/50';
            default: return 'border-border';
        }
    };

    const getIcon = () => {
        if (crisisMode) return <AlertTriangle size={18} className="text-white" />;
        switch(dailyRisk.status) {
            case RiskStatus.SAFE: return <ShieldCheck size={18} className="text-green-500" />;
            case RiskStatus.CAUTION: return <AlertTriangle size={18} className="text-amber-500" />;
            case RiskStatus.DANGER: return <ShieldAlert size={18} className="text-red-500" />;
            case RiskStatus.LOCKED: return <Lock size={18} className="text-red-500" />;
        }
    };

    const lossPercentage = dailyRisk.currentPnL < 0 
        ? Math.min(100, (Math.abs(dailyRisk.currentPnL) / profile.maxDailyLoss) * 100) 
        : 0;
        
    // Mental Bandwidth Color
    const bandwidthColor = mentalBandwidth > 70 ? 'bg-blue-500' : mentalBandwidth > 40 ? 'bg-amber-500' : 'bg-red-500';

    return (
        <div className={`w-full border-b ${getStatusColor()} transition-colors duration-500 ease-surgical`}>
            <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
                
                {/* Left: Status & AI Message */}
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="flex items-center gap-2 shrink-0">
                        {getIcon()}
                        <span className={`text-[10px] font-mono font-bold tracking-widest uppercase ${crisisMode ? 'text-white' : dailyRisk.status === RiskStatus.SAFE ? 'text-green-500' : dailyRisk.status === RiskStatus.LOCKED ? 'text-red-500' : 'text-white'}`}>
                            SYSTEM: {crisisMode ? 'CRISIS' : dailyRisk.status}
                        </span>
                    </div>
                    <div className="h-4 w-px bg-white/10 hidden md:block"></div>
                    <div className="text-[11px] font-mono text-gray-300 truncate md:max-w-md">
                        <span className="text-gray-500 mr-2">AI COMMAND:</span>
                        <span className="italic text-white">"{dailyRisk.aiGuidance}"</span>
                    </div>
                </div>

                {/* Right: Metrics */}
                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                    
                    {/* Mental Bandwidth Meter */}
                    <div className="w-24">
                         <div className="flex justify-between text-[8px] text-gray-500 uppercase mb-1 font-mono">
                             <span className="flex items-center gap-1"><Zap size={8}/> Bandwidth</span>
                             <span className={mentalBandwidth < 40 ? 'text-red-500' : 'text-white'}>{mentalBandwidth}%</span>
                         </div>
                         <div className="h-1 w-full bg-gray-900 rounded-full overflow-hidden">
                             <div className={`h-full ${bandwidthColor} transition-all duration-1000`} style={{ width: `${mentalBandwidth}%` }} />
                         </div>
                    </div>

                    <div className="h-6 w-px bg-white/10 hidden md:block"></div>

                    {/* Trade Counter */}
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] text-gray-500 uppercase tracking-widest">Trades</span>
                        <span className="text-xs font-mono text-white">{dailyRisk.tradeCount} <span className="text-gray-600">/ {profile.maxDailyTrades || 5}</span></span>
                    </div>

                    {/* PnL & Drawdown Bar */}
                    <div className="w-32 md:w-48">
                        <div className="flex justify-between text-[9px] text-gray-500 uppercase mb-1 font-mono">
                            <span>Daily PnL</span>
                            <span className={dailyRisk.currentPnL >= 0 ? 'text-green-500' : 'text-red-500'}>
                                {dailyRisk.currentPnL >= 0 ? '+' : ''}{dailyRisk.currentPnL}
                            </span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-900 rounded-full overflow-hidden relative">
                            <div className="absolute right-0 top-0 bottom-0 w-px bg-red-900 z-10" title="Max Loss"></div>
                            <div 
                                className={`h-full transition-all duration-500 ${lossPercentage > 80 ? 'bg-red-500 animate-pulse' : 'bg-red-800'}`}
                                style={{ width: `${lossPercentage}%` }}
                            />
                        </div>
                    </div>

                </div>
            </div>
            
            {/* LOCKDOWN OVERLAY */}
            {dailyRisk.status === RiskStatus.LOCKED && !crisisMode && (
                <div className="bg-red-500/10 text-center py-1 text-[10px] font-mono text-red-500 uppercase tracking-[0.2em] border-t border-red-900/50">
                    TRADING DISABLED /// MAX DRAWDOWN EXCEEDED
                </div>
            )}
        </div>
    );
};
