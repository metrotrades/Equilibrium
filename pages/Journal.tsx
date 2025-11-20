
import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Trade, TradeStatus, TradeResult, DisciplineRating, Emotion, ChecklistItem, MentorPersona, RiskStatus, MentalMarker, RuleTier } from '../types';
import { Button, Input, Textarea, Badge, VoiceRecorder } from '../components/UIComponents';
import { Plus, X, Upload, Sparkles, Hash, Calendar as CalIcon, PlayCircle, ShieldAlert, Mic, Moon, Play, Link2, Eye, Skull, Activity, Lock, AlertOctagon, RefreshCw } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { ZenMode } from '../components/ZenMode';
import { RiskGuardrail } from '../components/RiskGuardrail';

const DEFAULT_CHECKLIST: ChecklistItem[] = [
    { id: '1', label: 'HTF Context Aligned?', checked: false, required: true },
    { id: '2', label: 'Liquidity Sweep Confirmed?', checked: false, required: true },
    { id: '3', label: 'Risk < 2% Account?', checked: false, required: true },
    { id: '4', label: 'Accepting of Loss?', checked: false, required: true },
];

const STRATEGIES = ["Liquidity Grab", "SMT Divergence", "FVG Reversal", "Trend Continuation", "Range Fade"];

export const Journal: React.FC = () => {
  const { trades, addTrade, deleteTrade, profile, saveProfile, patterns, dailyRisk, crisisMode } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [zenModeOpen, setZenModeOpen] = useState(false);
  
  // Feature States
  const [brutalTruth, setBrutalTruth] = useState<{id: string, text: string} | null>(null);
  const [liquidityVision, setLiquidityVision] = useState<{text: string} | null>(null);
  const [rewriteData, setRewriteData] = useState<{ideal: string, reason: string} | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);

  // Marker State
  const [markers, setMarkers] = useState<MentalMarker[]>([]);
  const [markerInput, setMarkerInput] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [checklist, setChecklist] = useState<ChecklistItem[]>(DEFAULT_CHECKLIST);
  const [formData, setFormData] = useState<Partial<Trade>>({
    date: new Date().toISOString().split('T')[0],
    tradeTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    pair: '',
    direction: 'LONG',
    status: TradeStatus.OPEN,
    session: 'NY_AM',
    entryPrice: 0,
    stopLoss: 0,
    takeProfit: 0,
    quantity: 1,
    discipline: DisciplineRating.NEUTRAL,
    preTradeEmotion: Emotion.NEUTRAL,
    mistakes: [],
    tags: [],
    strategy: '',
    marketRegime: 'TRENDING',
    notes: '',
    lifestyle: { sleepHours: 7, stressLevel: 3, caffeineIntake: 'MODERATE', workout: false, mood: 'Neutral', dietQuality: 'AVERAGE' },
    isReplay: false
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, chartImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleCheck = (id: string) => {
      setChecklist(checklist.map(c => c.id === id ? { ...c, checked: !c.checked } : c));
  };

  const addMarker = () => {
      if(!markerInput) return;
      const newMarker: MentalMarker = { id: crypto.randomUUID(), label: markerInput, timestamp: new Date().toISOString(), context: 'Log' };
      setMarkers([...markers, newMarker]);
      setMarkerInput("");
  };

  const handleRewrite = async (trade: Trade) => {
      setLoadingAction(true);
      const res = await geminiService.rewriteScenario(trade);
      setRewriteData({ ideal: res.idealVersion, reason: res.reasoning });
      setLoadingAction(false);
  };

  const handleSave = async () => {
    if (!formData.pair || !formData.entryPrice) return;

    // RISK LOCK
    if (dailyRisk.status === RiskStatus.LOCKED || crisisMode) {
        alert("SYSTEM LOCKED: Trading disabled.");
        return;
    }

    if (profile.accountabilityMode) {
        const incomplete = checklist.some(c => c.required && !c.checked);
        if (incomplete) {
            alert("ACCOUNTABILITY LOCK: Checklist incomplete.");
            return;
        }
    }
    
    let rMultiple = 0;
    if (formData.entryPrice && formData.stopLoss && formData.takeProfit) {
        const risk = Math.abs(formData.entryPrice - formData.stopLoss);
        const reward = Math.abs(formData.takeProfit - formData.entryPrice);
        rMultiple = parseFloat((reward / risk).toFixed(2));
    }

    let aiAnalysisResult = null;
    let oppScore = 50;

    if (formData.notes) {
        setAnalyzing(true);
        const tempTrade = { ...formData, rMultiple, checklist, id: 'temp', mentalMarkers: markers } as Trade;
        
        // Parallel AI Calls
        const [analysis, opp] = await Promise.all([
            geminiService.analyzeTradeLog(tempTrade, profile.mentorPersona),
            geminiService.analyzeOpportunity(tempTrade)
        ]);
        
        aiAnalysisResult = analysis;
        oppScore = opp.score;
        setAnalyzing(false);
    }

    const newTrade: Trade = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      ...formData as any,
      rMultiple,
      checklist,
      mentalMarkers: markers,
      aiAnalysis: aiAnalysisResult?.analysis,
      aiScore: aiAnalysisResult?.score,
      mistakes: aiAnalysisResult?.mistakes || formData.mistakes,
      aiReplayAnalysis: aiAnalysisResult?.replay,
      aiCompressionSummary: aiAnalysisResult?.compression,
      detectedBiases: aiAnalysisResult?.biases,
      integrityStatus: aiAnalysisResult?.integrity || 'HIGH',
      pfcOverrideDetected: aiAnalysisResult?.pfcOverride || false,
      opportunityScore: oppScore
    };

    addTrade(newTrade);
    setIsAdding(false);
    setFormData({ date: new Date().toISOString().split('T')[0], tradeTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }), status: TradeStatus.OPEN, notes: '', lifestyle: { sleepHours: 7, stressLevel: 3, caffeineIntake: 'MODERATE', workout: false, mood: 'Neutral', dietQuality: 'AVERAGE' } });
    setChecklist(DEFAULT_CHECKLIST); 
    setMarkers([]);
  };

  return (
    <div className="animate-fade-in h-full flex flex-col relative -mt-8 -mx-8">
      {/* Risk Header */}
      <RiskGuardrail />

      {zenModeOpen && (
          <ZenMode 
            initialText={formData.notes || ''} 
            onClose={(text) => { setZenModeOpen(false); setFormData({...formData, notes: text}); }} 
          />
      )}

      {/* Scenario Rewrite Modal */}
      {rewriteData && (
          <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-6">
              <div className="max-w-2xl bg-black border border-purple-900/50 p-8 shadow-[0_0_50px_rgba(100,0,255,0.1)]">
                  <div className="flex items-center gap-3 mb-6 text-purple-400">
                      <RefreshCw size={20} />
                      <h3 className="text-sm font-mono uppercase tracking-widest">Scenario Rewrite (Ideal)</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                      <div className="bg-white/5 p-4 border-l-2 border-purple-500">
                          <p className="text-white font-serif text-sm leading-relaxed italic">"{rewriteData.ideal}"</p>
                      </div>
                      <div>
                          <div className="text-[10px] text-gray-500 uppercase mb-2">Why this is better</div>
                          <p className="text-gray-400 font-mono text-xs">{rewriteData.reason}</p>
                      </div>
                  </div>
                  <Button onClick={() => setRewriteData(null)} className="mt-6 w-full" variant="secondary">CLOSE SIMULATION</Button>
              </div>
          </div>
      )}

      <div className="px-8 pt-8">
        <div className="flex justify-between items-center border-b border-white/5 pb-6 mb-8">
            <div>
                <h2 className="text-xl font-light tracking-tight text-white">Trade Ledger</h2>
                <p className="text-[10px] font-mono text-gray-600 mt-1 uppercase tracking-widest">Historical Data & Entry Logging</p>
            </div>
            <div className="flex gap-4">
                <select 
                    className="bg-black border border-border text-[10px] font-mono text-gray-400 p-2 focus:text-white outline-none uppercase"
                    value={profile.mentorPersona}
                    onChange={(e) => saveProfile({...profile, mentorPersona: e.target.value as MentorPersona})}
                >
                    {Object.values(MentorPersona).map(p => <option key={p} value={p}>MENTOR: {p}</option>)}
                </select>
                <Button 
                    onClick={() => setIsAdding(true)} 
                    variant={dailyRisk.status === RiskStatus.LOCKED || crisisMode ? 'danger' : 'primary'} 
                    size="sm"
                    disabled={dailyRisk.status === RiskStatus.LOCKED || crisisMode}
                >
                  {(dailyRisk.status === RiskStatus.LOCKED || crisisMode) ? <><Lock className="w-3 h-3 mr-2"/> LOCKED</> : <><Plus className="w-3 h-3 mr-2" /> New Entry</>}
                </Button>
            </div>
        </div>

        {/* Modal */}
        {isAdding && (
            <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300">
            <div className="w-full max-w-5xl bg-[#050505] border border-border shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-border bg-black sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-gray-500" />
                        <h3 className="text-sm font-bold font-mono tracking-wider text-white uppercase">New Execution Record</h3>
                    </div>
                </div>
                <button onClick={() => setIsAdding(false)} className="text-gray-500 hover:text-white transition-all duration-200 hover:rotate-90"><X size={18} /></button>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Left Column: Checklist & Techs */}
                <div className="md:col-span-7 space-y-6">
                    
                    {/* Pre-Trade Checklist */}
                    <div className="bg-[#080808] p-4 border border-border/50">
                        <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-3 flex items-center gap-2">
                            <ShieldAlert size={12} /> Mandatory Checklist
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {checklist.map(item => (
                                <div key={item.id} onClick={() => toggleCheck(item.id)} className={`cursor-pointer border p-2 flex items-center gap-3 transition-all duration-200 ${item.checked ? 'bg-white/5 border-white/40' : 'border-border hover:border-gray-600'}`}>
                                    <div className={`w-3 h-3 border ${item.checked ? 'bg-white border-white' : 'border-gray-600'}`}></div>
                                    <span className={`text-[10px] font-mono uppercase ${item.checked ? 'text-white' : 'text-gray-500'}`}>{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <Input label="Date" type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                        <Input label="Exec Time" type="time" value={formData.tradeTime} onChange={e => setFormData({...formData, tradeTime: e.target.value})} />
                        <Input label="Instrument" placeholder="BTCUSD" value={formData.pair} onChange={e => setFormData({...formData, pair: e.target.value.toUpperCase()})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[9px] text-gray-500 uppercase mb-2 font-mono tracking-widest">Strategy</label>
                            <select 
                            className="w-full bg-[#080808] border border-border p-3 text-xs text-white focus:border-white/50 outline-none transition-all duration-200 ease-surgical"
                            value={formData.strategy}
                            onChange={e => setFormData({...formData, strategy: e.target.value})}
                            >
                            <option value="">Select Setup...</option>
                            {STRATEGIES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                    <Input label="Entry" type="number" value={formData.entryPrice} onChange={e => setFormData({...formData, entryPrice: parseFloat(e.target.value)})} />
                    <Input label="Stop" type="number" value={formData.stopLoss} onChange={e => setFormData({...formData, stopLoss: parseFloat(e.target.value)})} />
                    <Input label="TP" type="number" value={formData.takeProfit} onChange={e => setFormData({...formData, takeProfit: parseFloat(e.target.value)})} />
                    </div>
                    
                    <div className="pt-4 border-t border-border/50">
                        <label className="block text-[9px] text-gray-500 uppercase mb-2 font-mono tracking-widest">Outcome</label>
                        <div className="grid grid-cols-2 gap-4">
                            <select 
                            className="w-full bg-[#080808] border border-border p-3 text-xs text-white focus:border-white/50 outline-none transition-all duration-200 ease-surgical"
                            value={formData.result}
                            onChange={e => setFormData({...formData, result: e.target.value as any, status: TradeStatus.CLOSED})}
                            >
                            <option value="">Select Result...</option>
                            <option value={TradeResult.WIN}>WIN</option>
                            <option value={TradeResult.LOSS}>LOSS</option>
                            <option value={TradeResult.BREAK_EVEN}>BREAK EVEN</option>
                            </select>
                            {formData.result && (
                                <Input type="number" placeholder="PNL" value={formData.pnl} onChange={e => setFormData({...formData, pnl: parseFloat(e.target.value)})} />
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Context & Voice */}
                <div className="md:col-span-5 space-y-6">
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-4 border-b border-border pb-2">
                        <Sparkles size={10} /> Psychology & Logic
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[9px] text-gray-500 uppercase mb-2 font-mono tracking-widest">Emotion</label>
                            <select 
                            className="w-full bg-[#080808] border border-border p-3 text-xs text-white focus:border-white/50 outline-none transition-all duration-200 ease-surgical"
                            value={formData.preTradeEmotion}
                            onChange={e => setFormData({...formData, preTradeEmotion: e.target.value as any})}
                            >
                            {Object.values(Emotion).map(e => <option key={e} value={e}>{e}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    {/* Mental Markers Input */}
                    <div>
                        <label className="block text-[9px] text-gray-500 uppercase mb-2 font-mono tracking-widest">Mental Markers</label>
                        <div className="flex gap-2 mb-2">
                            <Input placeholder="e.g. 'Felt FOMO at entry'" value={markerInput} onChange={e => setMarkerInput(e.target.value)} className="mb-0"/>
                            <Button size="sm" onClick={addMarker}>ADD</Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {markers.map(m => (
                                <Badge key={m.id} variant="outline">{m.label}</Badge>
                            ))}
                        </div>
                    </div>
                    
                    <div className="relative">
                        <Textarea 
                            label="Execution Logic" 
                            placeholder="Describe setup, logic, and context..."
                            value={formData.notes} 
                            onChange={e => setFormData({...formData, notes: e.target.value})} 
                            className="min-h-[120px]"
                        />
                        <div className="absolute bottom-3 right-3 flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setZenModeOpen(true)} className="bg-black border border-gray-700 hover:border-white text-[9px]">
                                <Moon size={10} className="mr-1"/> ZEN MODE
                            </Button>
                        </div>
                    </div>
                    
                    <div className="border border-dashed border-border hover:border-white/30 p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#080808] group" onClick={() => fileInputRef.current?.click()}>
                        {formData.chartImage ? (
                            <div className="relative w-full aspect-video overflow-hidden border border-border">
                                <img src={formData.chartImage} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <>
                                <Upload className="w-5 h-5 mb-2 text-gray-600 group-hover:text-white transition-colors duration-200" />
                                <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest group-hover:text-gray-300 transition-colors duration-200">Upload Screenshot</span>
                            </>
                        )}
                        <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleImageUpload} />
                    </div>
                </div>
                </div>
                
                <div className="p-6 border-t border-border bg-black flex justify-between items-center">
                <div className="text-[10px] text-gray-600 font-mono">
                    ANALYSIS BY: {profile.mentorPersona}
                </div>
                <div className="flex gap-3">
                    <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleSave} isLoading={analyzing}>
                        {analyzing ? 'ANALYZING...' : 'LOG EXECUTION'}
                    </Button>
                </div>
                </div>
            </div>
            </div>
        )}

        {/* Trade List */}
        <div className="flex-1 overflow-auto">
            <div className="grid grid-cols-1 gap-px bg-border/50 border border-border/50">
            {trades.length === 0 ? (
            <div className="bg-[#050505] p-20 text-center">
                <div className="text-gray-700 font-mono text-xs tracking-widest">NO ENTRIES FOUND</div>
            </div>
            ) : (
            trades.map(trade => (
                <div key={trade.id} className="bg-[#050505] p-6 hover:bg-white/5 transition-all duration-300 ease-surgical group relative hover:border-l border-l-0 hover:border-white/50">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="w-24 h-24 bg-black border border-border flex items-center justify-center overflow-hidden shrink-0 transition-transform duration-300 group-hover:scale-105">
                        {trade.chartImage ? (
                            <img src={trade.chartImage} className="w-full h-full object-cover opacity-50 group-hover:opacity-90 transition duration-500 grayscale group-hover:grayscale-0" />
                        ) : (
                            <span className="text-[9px] text-gray-700 font-mono">NO DATA</span>
                        )}
                        </div>

                        <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="font-mono font-bold text-white tracking-tight group-hover:text-white/90">{trade.pair}</span>
                            <span className="text-[10px] text-gray-600 font-mono uppercase">{trade.date} // {trade.session}</span>
                            {trade.strategy && <Badge variant="outline">{trade.strategy}</Badge>}
                            
                            {/* Quality Score */}
                            {trade.opportunityScore !== undefined && (
                                <Badge variant={trade.opportunityScore > 70 ? 'success' : trade.opportunityScore < 40 ? 'danger' : 'outline'}>
                                    QUAL: {trade.opportunityScore}/100
                                </Badge>
                            )}
                        </div>
                        
                        {trade.mentalMarkers && trade.mentalMarkers.length > 0 && (
                            <div className="flex gap-2 mb-2 flex-wrap">
                                {trade.mentalMarkers.map(m => (
                                    <span key={m.id} className="text-[9px] bg-white/5 border border-white/10 px-1 text-gray-400">{m.label}</span>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button onClick={() => handleRewrite(trade)} className="text-[9px] border border-purple-900/30 text-purple-500 px-2 py-1 hover:bg-purple-900/20 uppercase tracking-wider flex items-center gap-1">
                                <RefreshCw size={10} /> Rewrite Scenario
                            </button>
                        </div>
                        </div>
                        
                        <div className="text-right shrink-0">
                            <div className={`text-lg font-light font-mono ${trade.pnl && trade.pnl > 0 ? 'text-white' : 'text-gray-500'}`}>
                            {trade.pnl ? (trade.pnl > 0 ? `+$${trade.pnl}` : `$${trade.pnl}`) : 'OPEN'}
                            </div>
                            <div className="text-[10px] text-gray-600 font-mono mt-1">{trade.rMultiple}R</div>
                            
                            <button 
                                onClick={(e) => { e.stopPropagation(); deleteTrade(trade.id); }} 
                                className="text-[9px] text-red-900 hover:text-red-500 uppercase tracking-widest mt-2 block w-full text-right transition-colors duration-200 opacity-0 group-hover:opacity-100"
                            >
                                Terminate
                            </button>
                        </div>
                    </div>
                </div>
            ))
            )}
            </div>
        </div>
      </div>
    </div>
  );
};
