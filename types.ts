
export enum TradeStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export enum TradeResult {
  WIN = 'WIN',
  LOSS = 'LOSS',
  BREAK_EVEN = 'BREAK_EVEN',
}

export enum DisciplineRating {
  PERFECT = 5,
  GOOD = 4,
  NEUTRAL = 3,
  POOR = 2,
  TERRIBLE = 1,
}

export enum Emotion {
  NEUTRAL = 'NEUTRAL',
  CONFIDENT = 'CONFIDENT',
  ANXIOUS = 'ANXIOUS',
  GREEDY = 'GREEDY',
  FEARFUL = 'FEARFUL',
  FRUSTRATED = 'FRUSTRATED',
  HOPEFUL = 'HOPEFUL',
  REVENGE = 'REVENGE',
  FOMO = 'FOMO',
  TILTED = 'TILTED',
  ZONED_IN = 'ZONED_IN',
  BORED = 'BORED',
  EUPHORIC = 'EUPHORIC',
  RAGE = 'RAGE',
  DESPAIR = 'DESPAIR'
}

export enum MentorPersona {
  TOUGH = 'TOUGH',
  CALM = 'CALM',
  DIRECT = 'DIRECT',
  COMPASSIONATE = 'COMPASSIONATE',
  TACTICAL = 'TACTICAL',
  HYPER_LOGICAL = 'HYPER_LOGICAL',
  ZEN = 'ZEN'
}

export enum RiskStatus {
  SAFE = 'SAFE',         
  CAUTION = 'CAUTION',   
  DANGER = 'DANGER',     
  LOCKED = 'LOCKED',
  CRISIS = 'CRISIS'
}

export interface DailyRiskMetrics {
  currentPnL: number;
  tradeCount: number;
  winStreak: number;
  lossStreak: number;
  maxDrawdownHit: boolean;
  status: RiskStatus;
  aiGuidance: string;
  volatilityScore: number; 
  mentalBandwidth: number; // 0-100
}

export interface VoiceNote {
  id: string;
  timestamp: number;
  audioBlob?: Blob;
  transcription: string;
  detectedEmotion: Emotion;
  aiSummary: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  required: boolean;
}

export interface LifestyleMetrics {
  sleepHours: number;
  stressLevel: 1 | 2 | 3 | 4 | 5; 
  caffeineIntake: 'NONE' | 'LOW' | 'MODERATE' | 'HIGH';
  workout: boolean;
  mood: string;
  dietQuality: 'POOR' | 'AVERAGE' | 'CLEAN';
}

export interface MasterPattern {
  id: string;
  name: string;
  description: string;
  rules: string[];
  imageUrl?: string;
  winRate?: number;
}

export interface Contract {
  id: string;
  title: string;
  terms: string;
  consequences: string;
  startDate: string;
  active: boolean;
  breaches: number;
  streak: number;
}

export interface MentalMarker {
    id: string;
    label: string; // "FOMO triggered", "Hesitation"
    timestamp: string;
    context: string;
}

export interface Trade {
  id: string;
  date: string;
  tradeTime?: string; 
  createdAt?: number; 
  pair: string;
  direction: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice?: number;
  stopLoss: number;
  takeProfit: number;
  quantity: number;
  pnl?: number;
  rMultiple?: number;
  status: TradeStatus;
  result?: TradeResult;
  isReplay?: boolean;
  accountId?: string;
  
  session: 'ASIA' | 'LONDON' | 'NY_AM' | 'NY_PM';
  strategy: string; 
  marketRegime?: 'TRENDING' | 'RANGING' | 'CHOP' | 'VOLATILE';
  confluence: string[];
  linkedPatternId?: string; 
  
  lifestyle?: LifestyleMetrics;
  checklist?: ChecklistItem[];
  voiceNotes?: VoiceNote[];
  mentalMarkers?: MentalMarker[];
  
  preTradeEmotion: Emotion;
  postTradeEmotion?: Emotion;
  discipline: DisciplineRating;
  notes: string;
  mistakes: string[];
  tags: string[];
  
  aiAnalysis?: string;
  aiScore?: number;
  aiReplayAnalysis?: string; 
  aiCompressionSummary?: string; 
  aiRootCause?: string; 
  detectedBiases?: string[];
  
  integrityStatus?: 'HIGH' | 'QUESTIONABLE' | 'LOW';
  pfcOverrideDetected?: boolean;
  liquidityVision?: string;
  timingScore?: number; 
  opportunityScore?: number; // 0-100 Quality Score
  
  chartImage?: string;
  
  wasMissed?: boolean;
  regretSeverity?: number; // 0-10
  coldStateAnalysis?: string;
  scenarioRewrite?: {
      idealVersion: string;
      reasoning: string;
  };
}

export interface SessionPersonality {
    session: string;
    profile: string; 
    volatility: number; 
    discipline: number; 
    summary: string;
}

export interface DarkSideProfile {
    archetype: string;
    trigger: string;
    sabotagePattern: string;
    neutralization: string;
}

export interface TradingPhilosophy {
    corePrinciples: string[];
    identityStatement: string;
    commandments: string[];
}

export enum RuleTier {
    TIER_1 = "NON_NEGOTIABLE", // Must never break
    TIER_2 = "IMPORTANT",      // Flexible in extreme edge cases
    TIER_3 = "OPTIMIZATION"    // Good to have
}

export interface Rule {
    id: string;
    text: string;
    tier: RuleTier;
    breaks: number;
}

export interface IdentityGoal {
    id: string;
    term: '90_DAY' | '30_DAY' | 'WEEKLY';
    goal: string;
    progress: number; // 0-100
}

export interface UserProfile {
  name: string;
  accountBalance: number;
  riskPerTrade: number; 
  maxDailyLoss: number; 
  maxDailyTrades: number; 
  rules: Rule[]; // Changed from string[]
  apiKey?: string;
  
  accountabilityMode: boolean;
  mentorPersona: MentorPersona;
  
  tradingPlan?: string; 
  identityStatement?: string; 
  archetype?: string;
  talentScore?: TalentScore;
  sessionPersonalities?: SessionPersonality[];
  darkSideProfile?: DarkSideProfile;
  philosophy?: TradingPhilosophy;
  
  identityGoals?: IdentityGoal[];
}

export interface TalentScore {
  total: number; 
  breakdown: {
      patience: number;
      discipline: number;
      resilience: number;
      execution: number;
  };
  summary: string;
}

export interface AiInsight {
  id: string;
  date: string;
  type: 'WEEKLY_REVIEW' | 'PSYCHOLOGY_ALERT' | 'PATTERN_DETECTED' | 'IDENTITY_UPDATE' | 'BIAS_DETECTED';
  content: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

export interface Habit {
  id: string;
  text: string;
  streak: number;
  completedToday: boolean;
  category: 'MINDSET' | 'EXECUTION' | 'HEALTH';
}

export interface SessionPlan {
  id: string;
  date: string;
  bias: string;
  focusPoints: string[];
  traps: string[];
  newsEvents: string[];
  memoryAnchor?: string;
}

export interface Account {
    id: string;
    name: string;
    type: 'PROP' | 'PERSONAL' | 'CHALLENGE';
    balance: number;
}

export interface PsychTrigger {
    trigger: string;
    mitigation: string;
}

export interface FragilityIndex {
    score: number; // 0-100 (High is fragile)
    level: 'RESILIENT' | 'SHAKY' | 'FRAGILE' | 'CRITICAL';
}

export interface RhythmProfile {
    peakZone: string;
    slumpWindow: string;
    dangerHours: string;
}

export interface MotivationalProfile {
    motivators: string[];
    drains: string[];
    affirmations: string[];
}

export interface ChatMessage {
    id: string;
    sender: 'USER' | 'AI';
    text: string;
    timestamp: number;
}

export interface NeuroPatternReport {
    thoughtLoops: string[];
    emotionalSpirals: string[];
    summary: string;
}

export interface BlindspotReport {
    missedSetups: string[];
    overlookedStrengths: string[];
    deniedPatterns: string[];
}
