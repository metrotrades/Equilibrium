
import { Trade, UserProfile, AiInsight, MasterPattern, Contract, MentorPersona, RuleTier } from '../types';

const STORAGE_KEYS = {
  TRADES: 'equilibrium_trades',
  PROFILE: 'equilibrium_profile',
  INSIGHTS: 'equilibrium_insights',
  PATTERNS: 'equilibrium_patterns',
  CONTRACTS: 'equilibrium_contracts'
};

export const storageService = {
  getTrades: (): Trade[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRADES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Failed to load trades", e);
      return [];
    }
  },

  saveTrades: (trades: Trade[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRADES, JSON.stringify(trades));
    } catch (e) {
      console.error("Failed to save trades", e);
    }
  },

  addTrade: (trade: Trade) => {
    const trades = storageService.getTrades();
    const newTrades = [trade, ...trades];
    storageService.saveTrades(newTrades);
    return newTrades;
  },

  updateTrade: (updatedTrade: Trade) => {
    const trades = storageService.getTrades();
    const newTrades = trades.map(t => t.id === updatedTrade.id ? updatedTrade : t);
    storageService.saveTrades(newTrades);
    return newTrades;
  },

  deleteTrade: (id: string) => {
    const trades = storageService.getTrades();
    const newTrades = trades.filter(t => t.id !== id);
    storageService.saveTrades(newTrades);
    return newTrades;
  },

  getProfile: (): UserProfile => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      const defaultProfile = {
        name: 'Trader',
        accountBalance: 10000,
        riskPerTrade: 1,
        maxDailyLoss: 500,
        maxDailyTrades: 5,
        accountabilityMode: false,
        mentorPersona: MentorPersona.DIRECT,
        rules: [
          { id: '1', text: 'No FOMO', tier: RuleTier.TIER_1, breaks: 0 },
          { id: '2', text: 'Max 3 losses per day', tier: RuleTier.TIER_1, breaks: 0 },
          { id: '3', text: 'Wait for candle close', tier: RuleTier.TIER_2, breaks: 0 }
        ]
      };

      if (data) {
        const parsed = JSON.parse(data);
        return { ...defaultProfile, ...parsed };
      }

      return defaultProfile;
    } catch (e) {
      return { 
        name: 'Trader', 
        accountBalance: 10000, 
        riskPerTrade: 1, 
        maxDailyLoss: 500,
        maxDailyTrades: 5,
        accountabilityMode: false,
        mentorPersona: MentorPersona.DIRECT,
        rules: [] 
      };
    }
  },

  saveProfile: (profile: UserProfile) => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  },

  getInsights: (): AiInsight[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INSIGHTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  addInsight: (insight: AiInsight) => {
    const insights = storageService.getInsights();
    const newInsights = [insight, ...insights];
    localStorage.setItem(STORAGE_KEYS.INSIGHTS, JSON.stringify(newInsights));
    return newInsights;
  },

  getPatterns: (): MasterPattern[] => {
      try {
          const data = localStorage.getItem(STORAGE_KEYS.PATTERNS);
          return data ? JSON.parse(data) : [];
      } catch { return []; }
  },

  savePatterns: (patterns: MasterPattern[]) => {
      localStorage.setItem(STORAGE_KEYS.PATTERNS, JSON.stringify(patterns));
  },

  getContracts: (): Contract[] => {
      try {
          const data = localStorage.getItem(STORAGE_KEYS.CONTRACTS);
          return data ? JSON.parse(data) : [];
      } catch { return []; }
  },

  saveContracts: (contracts: Contract[]) => {
      localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(contracts));
  }
};
