
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Trade, UserProfile, AiInsight, MasterPattern, Contract, DailyRiskMetrics, RiskStatus, TradeResult, Account, RuleTier, Rule } from '../types';
import { storageService } from '../services/storageService';
import { geminiService } from '../services/geminiService';

interface AppContextType {
  trades: Trade[];
  profile: UserProfile;
  insights: AiInsight[];
  patterns: MasterPattern[];
  contracts: Contract[];
  dailyRisk: DailyRiskMetrics;
  accounts: Account[];
  activeAccount: string;
  mentalBandwidth: number;
  crisisMode: boolean;
  psychFingerprint: {
      volatility: number;
      clarity: number;
      discipline: number;
  };
  
  addTrade: (trade: Trade) => void;
  updateTrade: (trade: Trade) => void;
  deleteTrade: (id: string) => void;
  refreshData: () => void;
  saveProfile: (profile: UserProfile) => void;
  addInsight: (insight: AiInsight) => void;
  addPattern: (pattern: MasterPattern) => void;
  addContract: (contract: Contract) => void;
  setAccount: (id: string) => void;
  addAccount: (account: Account) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [profile, setProfile] = useState<UserProfile>(storageService.getProfile());
  const [insights, setInsights] = useState<AiInsight[]>([]);
  const [patterns, setPatterns] = useState<MasterPattern[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeAccount, setActiveAccount] = useState<string>('default');
  
  // New Real-Time Metrics
  const [mentalBandwidth, setMentalBandwidth] = useState(100);
  const [crisisMode, setCrisisMode] = useState(false);
  const [psychFingerprint, setPsychFingerprint] = useState({ volatility: 0, clarity: 80, discipline: 80 });

  const [dailyRisk, setDailyRisk] = useState<DailyRiskMetrics>({
      currentPnL: 0,
      tradeCount: 0,
      winStreak: 0,
      lossStreak: 0,
      maxDrawdownHit: false,
      status: RiskStatus.SAFE,
      aiGuidance: "System ready.",
      volatilityScore: 0,
      mentalBandwidth: 100
  });

  const refreshData = () => {
    setTrades(storageService.getTrades());
    setInsights(storageService.getInsights());
    
    // Default Profile migration for rules
    const prof = storageService.getProfile();
    if(prof.rules && typeof prof.rules[0] === 'string') {
        prof.rules = (prof.rules as any).map((r: string, i: number) => ({
            id: i.toString(),
            text: r,
            tier: RuleTier.TIER_2,
            breaks: 0
        }));
    }
    setProfile(prof);
    
    setPatterns(storageService.getPatterns());
    setContracts(storageService.getContracts());
    // Mock accounts for now
    setAccounts([{ id: 'default', name: 'Main Account', type: 'PERSONAL', balance: 10000 }]);
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Calculate Mental Bandwidth & Fingerprint
  useEffect(() => {
      const calculatePsychMetrics = () => {
          const recentTrades = trades.slice(0, 5);
          if (recentTrades.length === 0) return;
          
          // Bandwidth Decay Factors
          let bandwidth = 100;
          // 1. Decay by open trades
          const openTrades = trades.filter(t => t.status === 'OPEN').length;
          bandwidth -= (openTrades * 10); 
          
          // 2. Decay by recent emotional volatility
          const recentEmotions = recentTrades.map(t => t.preTradeEmotion);
          const highStress = recentEmotions.filter(e => ['ANXIOUS', 'FEARFUL', 'RAGE', 'TILTED', 'DESPAIR'].includes(e)).length;
          bandwidth -= (highStress * 15);
          
          // 3. Decay by loss streak
          if (dailyRisk.lossStreak > 2) bandwidth -= 20;

          setMentalBandwidth(Math.max(0, bandwidth));

          // Crisis Check
          const lastEmotion = recentTrades[0]?.preTradeEmotion;
          if (['RAGE', 'TILTED', 'DESPAIR'].includes(lastEmotion)) {
              setCrisisMode(true);
          } else {
              setCrisisMode(false);
          }
          
          setPsychFingerprint({
              volatility: highStress * 20,
              clarity: Math.max(0, bandwidth),
              discipline: 100 - (dailyRisk.lossStreak * 10)
          });
      };
      
      calculatePsychMetrics();
  }, [trades, dailyRisk]);

  useEffect(() => {
      calculateRisk();
  }, [trades, profile, mentalBandwidth]);

  const calculateRisk = async () => {
      const today = new Date().toISOString().split('T')[0];
      const todayTrades = trades.filter(t => t.date === today && t.status === 'CLOSED');
      
      let pnl = 0;
      let winStreak = 0;
      let lossStreak = 0;
      
      const sortedTrades = [...todayTrades].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

      sortedTrades.forEach(t => {
          pnl += (t.pnl || 0);
          if (t.result === TradeResult.WIN) {
              winStreak++;
              lossStreak = 0;
          } else if (t.result === TradeResult.LOSS) {
              lossStreak++;
              winStreak = 0;
          }
      });

      let status = RiskStatus.SAFE;
      if (crisisMode) status = RiskStatus.CRISIS;
      else if (pnl <= -profile.maxDailyLoss) status = RiskStatus.LOCKED;
      else if (pnl <= -(profile.maxDailyLoss * 0.7)) status = RiskStatus.DANGER;
      else if (lossStreak >= 3) status = RiskStatus.CAUTION;
      else if (sortedTrades.length >= profile.maxDailyTrades) status = RiskStatus.DANGER;

      const metrics: DailyRiskMetrics = {
          currentPnL: pnl,
          tradeCount: sortedTrades.length,
          winStreak,
          lossStreak,
          maxDrawdownHit: pnl <= -profile.maxDailyLoss,
          status,
          aiGuidance: dailyRisk.aiGuidance,
          volatilityScore: dailyRisk.volatilityScore,
          mentalBandwidth
      };

      if (sortedTrades.length > 0 && (status !== dailyRisk.status || sortedTrades.length % 3 === 0)) {
          const guidance = await geminiService.generateRiskGuidance(metrics, profile);
          metrics.aiGuidance = guidance;
      }

      setDailyRisk(metrics);
  };

  const addTrade = (trade: Trade) => {
    const newTrades = storageService.addTrade(trade);
    setTrades(newTrades);
  };

  const updateTrade = (trade: Trade) => {
    const newTrades = storageService.updateTrade(trade);
    setTrades(newTrades);
  };

  const deleteTrade = (id: string) => {
    const newTrades = storageService.deleteTrade(id);
    setTrades(newTrades);
  };

  const saveProfileCtx = (newProfile: UserProfile) => {
    storageService.saveProfile(newProfile);
    setProfile(newProfile);
  };
  
  const addInsightCtx = (insight: AiInsight) => {
      const newInsights = storageService.addInsight(insight);
      setInsights(newInsights);
  };

  const addPatternCtx = (pattern: MasterPattern) => {
      const newPatterns = [...patterns, pattern];
      storageService.savePatterns(newPatterns);
      setPatterns(newPatterns);
  };

  const addContractCtx = (contract: Contract) => {
      const newContracts = [...contracts, contract];
      storageService.saveContracts(newContracts);
      setContracts(newContracts);
  };

  const setAccount = (id: string) => setActiveAccount(id);
  const addAccount = (acc: Account) => setAccounts([...accounts, acc]);

  return (
    <AppContext.Provider value={{ 
      trades, 
      profile, 
      insights, 
      patterns,
      contracts,
      dailyRisk,
      accounts,
      activeAccount,
      mentalBandwidth,
      crisisMode,
      psychFingerprint,
      addTrade, 
      updateTrade, 
      deleteTrade, 
      refreshData,
      saveProfile: saveProfileCtx,
      addInsight: addInsightCtx,
      addPattern: addPatternCtx,
      addContract: addContractCtx,
      setAccount,
      addAccount
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
