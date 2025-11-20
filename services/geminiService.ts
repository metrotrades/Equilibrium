
import { GoogleGenAI, Type } from "@google/genai";
import { Trade, Emotion, UserProfile, SessionPlan, MentorPersona, TalentScore, SessionPersonality, DarkSideProfile, TradingPhilosophy, DailyRiskMetrics, ChatMessage, NeuroPatternReport, BlindspotReport } from "../types";

const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

export const geminiService = {
  async analyzeTradeLog(trade: Trade, persona: MentorPersona): Promise<{ analysis: string; score: number; mistakes: string[]; replay: string; compression: string; biases: string[]; integrity: 'HIGH'|'QUESTIONABLE'|'LOW'; pfcOverride: boolean }> {
    if (!apiKey) {
      return {
        analysis: "API Key missing.", score: 0, mistakes: [], replay: "N/A", compression: "N/A", biases: [], integrity: 'HIGH', pfcOverride: false
      };
    }

    const personaPrompts = {
        [MentorPersona.TOUGH]: "You are a ruthless, drill-sergeant trading mentor. Do not sugarcoat anything. Call out stupidity immediately.",
        [MentorPersona.CALM]: "You are a zen master. Speak about flow, balance, and patience. Be gentle but firm.",
        [MentorPersona.DIRECT]: "You are a professional prop trader. Brief, punchy, and factual. No emotion.",
        [MentorPersona.COMPASSIONATE]: "You are a supportive coach. Focus on growth and encouragement.",
        [MentorPersona.TACTICAL]: "You are a strategy technician. Focus purely on the mechanics, levels, and system logic.",
        [MentorPersona.HYPER_LOGICAL]: "You are an AI algorithm. Pure logic. If X then Y. Eliminate all emotion.",
        [MentorPersona.ZEN]: "You are a monk. Use metaphors about water, wind, and stillness."
    };

    const prompt = `
      ${personaPrompts[persona]}
      Analyze this trade.
      
      Context:
      - User Notes: "${trade.notes}"
      - Result: ${trade.result}
      - Emotion: ${trade.preTradeEmotion}
      - Markers: ${trade.mentalMarkers?.map(m => m.label).join(', ') || 'None'}
      
      Tasks:
      1. Analyze deeply in persona.
      2. Score it (0-100).
      3. Find mistakes.
      4. Replay ideal scenario.
      5. Compression summary (1 sentence).
      6. Detect biases.
      7. CHECK INTEGRITY: Does their explanation sound like rationalization or lying?
      8. DETECT PFC OVERRIDE: Is the writing emotional, fragmented, or illogical?

      Output JSON.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              analysis: { type: Type.STRING },
              score: { type: Type.NUMBER },
              mistakes: { type: Type.ARRAY, items: { type: Type.STRING } },
              replay: { type: Type.STRING },
              compression: { type: Type.STRING },
              biases: { type: Type.ARRAY, items: { type: Type.STRING } },
              integrity: { type: Type.STRING, enum: ['HIGH', 'QUESTIONABLE', 'LOW'] },
              pfcOverride: { type: Type.BOOLEAN }
            }
          }
        }
      });

      const json = JSON.parse(response.text || '{}');
      return {
        analysis: json.analysis || "Analysis failed.",
        score: json.score || 0,
        mistakes: json.mistakes || [],
        replay: json.replay || "Replay unavailable.",
        compression: json.compression || "Summary unavailable.",
        biases: json.biases || [],
        integrity: json.integrity || 'HIGH',
        pfcOverride: json.pfcOverride || false
      };

    } catch (error) {
      return { analysis: "AI Error.", score: 0, mistakes: [], replay: "", compression: "", biases: [], integrity: 'HIGH', pfcOverride: false };
    }
  },

  async chatWithCompanion(history: ChatMessage[], userMessage: string, profile: UserProfile): Promise<string> {
      if(!apiKey) return "System offline.";
      
      const context = history.map(m => `${m.sender}: ${m.text}`).join('\n');
      const prompt = `
         You are Equilibrium, an AI Trading Therapist and High-Performance Coach.
         Your goal: Help the trader maximize psychology, discipline, and strategy.
         User Persona: ${profile.mentorPersona}
         User Archetype: ${profile.archetype || "Unknown"}
         
         Chat History:
         ${context}
         USER: ${userMessage}
         
         Respond concisely. Use the user's persona tone.
         If they are emotional, ground them.
         If they are strategic, be tactical.
      `;
      
      try {
          const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
          return response.text || "I am listening.";
      } catch(e) { return "Connection error."; }
  },

  async analyzeNeuroPatterns(trades: Trade[]): Promise<NeuroPatternReport> {
      const prompt = `
        Analyze the writing style and emotional content of these ${trades.length} trades.
        Notes: ${trades.map(t => t.notes).join(" | ")}
        Emotions: ${trades.map(t => t.preTradeEmotion).join(" | ")}
        
        Identify:
        1. Thought Loops (recurring negative phrases).
        2. Emotional Spirals (sequences of declining mood).
        
        JSON Output: { thoughtLoops: [], emotionalSpirals: [], summary: string }
      `;
      try {
          const response = await ai.models.generateContent({ 
             model: 'gemini-2.5-flash', 
             contents: prompt,
             config: { responseMimeType: "application/json" }
          });
          return JSON.parse(response.text || '{}');
      } catch(e) { return { thoughtLoops: [], emotionalSpirals: [], summary: "Error" }; }
  },

  async analyzeOpportunity(trade: Trade): Promise<{score: number, comparison: string}> {
      const prompt = `
         Analyze Opportunity Quality:
         Strategy: ${trade.strategy}
         Context: ${trade.notes}
         
         Was this a "High Quality" setup or an "Impulse/Boredom" trade?
         Score 0 (Terrible/Impulse) to 100 (Perfect A+ Setup).
         Provide a 1 sentence comparison to an ideal setup.
         
         JSON: { score: number, comparison: string }
      `;
      try {
          const response = await ai.models.generateContent({ 
             model: 'gemini-2.5-flash', 
             contents: prompt,
             config: { responseMimeType: "application/json" }
          });
          return JSON.parse(response.text || '{}');
      } catch(e) { return { score: 50, comparison: "N/A" }; }
  },

  async rewriteScenario(trade: Trade): Promise<{idealVersion: string, reasoning: string}> {
      const prompt = `
         Rewrite this trade scenario: "${trade.notes}".
         Result: ${trade.result}. Mistake: ${trade.mistakes.join(',')}.
         
         Write a version where the trader acted PERFECTLY (Emotionless, Strategic).
         Explain WHY this version is better.
         
         JSON: { idealVersion: string, reasoning: string }
      `;
      try {
          const response = await ai.models.generateContent({ 
             model: 'gemini-2.5-flash', 
             contents: prompt,
             config: { responseMimeType: "application/json" }
          });
          return JSON.parse(response.text || '{}');
      } catch(e) { return { idealVersion: "Error", reasoning: "Error" }; }
  },

  async analyzeSecondOrderEffects(trades: Trade[]): Promise<string> {
      const prompt = `
        Analyze the SEQUENCE of these trades.
        How does a WIN affect the NEXT trade?
        How does a LOSS affect the NEXT trade?
        Find the "Second Order Effects" - e.g., "After a big win, you tend to over-leverage."
        Output a short paragraph describing the domino effects found.
      `;
      try {
          const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
          return response.text || "No correlations found.";
      } catch(e) { return "Error."; }
  },

  async detectBlindspots(trades: Trade[]): Promise<BlindspotReport> {
      const prompt = `
         Look for what is MISSING in these trade logs:
         ${trades.slice(0, 10).map(t => t.notes).join(" | ")}
         
         What does the trader NEVER mention? (e.g. Market Structure, News, Mental State, Exit Logic).
         What strengths do they ignore?
         
         JSON: { missedSetups: [], overlookedStrengths: [], deniedPatterns: [] }
      `;
      try {
          const response = await ai.models.generateContent({ 
             model: 'gemini-2.5-flash', 
             contents: prompt,
             config: { responseMimeType: "application/json" }
          });
          return JSON.parse(response.text || '{}');
      } catch(e) { return { missedSetups: [], overlookedStrengths: [], deniedPatterns: [] }; }
  },

  async generateRiskGuidance(metrics: DailyRiskMetrics, profile: UserProfile): Promise<string> {
      if(!apiKey) return "Monitor your risk.";
      
      const prompt = `
        You are an AI Risk Manager.
        Status:
        - Daily PnL: $${metrics.currentPnL} (Max Loss: $${profile.maxDailyLoss})
        - Trades: ${metrics.tradeCount} (Limit: ${profile.maxDailyTrades})
        - Bandwidth: ${metrics.mentalBandwidth}% (Cognitive Load)
        
        Give a ONE SENTENCE surgical command.
        If bandwidth low (<40%), tell them to rest.
        If near max loss, STOP THEM.
      `;
      
      try {
          const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
          return response.text || "Maintain discipline.";
      } catch (e) { return "Risk system offline."; }
  },

  // ... (Keep existing methods: generateBrutalTruth, analyzeSessionPersonalities, etc. - Ensure they are preserved)
  async generateBrutalTruth(trade: Trade): Promise<string> {
      const prompt = `Look at this trade: ${trade.result}. Notes: "${trade.notes}". Mistakes: ${trade.mistakes.join(', ')}. Tell the user EXACTLY why they failed or succeeded in blunt, slightly harsh English. Start with "You..."`;
      try { const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt }); return response.text || "No truth found."; } catch (e) { return "Error."; }
  },

  async analyzeSessionPersonalities(trades: Trade[]): Promise<SessionPersonality[]> {
      const prompt = `Analyze these trades by session. Output JSON array: { session, profile, summary, volatility (0-100), discipline (0-100) }`;
      try { const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json" } }); return JSON.parse(response.text || '[]'); } catch (e) { return []; }
  },
  
  async analyzeDarkSide(trades: Trade[]): Promise<DarkSideProfile> {
      const prompt = `Identify "Dark Side" archetype from mistakes: ${trades.flatMap(t => t.mistakes).join(', ')}. JSON: { archetype, trigger, sabotagePattern, neutralization }`;
      try { const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json" } }); return JSON.parse(response.text || '{}'); } catch (e) { return { archetype: "Unknown", trigger: "", sabotagePattern: "", neutralization: "" }; }
  },

  async generatePhilosophy(trades: Trade[]): Promise<TradingPhilosophy> {
      const prompt = `Build "Trading Philosophy". JSON: { corePrinciples: [], identityStatement: "", commandments: [] }`;
      try { const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json" } }); return JSON.parse(response.text || '{}'); } catch (e) { return { corePrinciples: [], identityStatement: "", commandments: [] }; }
  },
  
  async analyzeLiquidityVision(chart: string, notes: string): Promise<string> {
      const prompt = `Based on notes: "${notes}", describe where LIQUIDITY is.`;
      try { const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt }); return response.text || "N/A"; } catch (e) { return "Error."; }
  },

  async generateMentorMirror(trades: Trade[]): Promise<string> {
      const prompt = `Write a letter FROM the user TO the user based on these trades.`;
      try { const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt }); return response.text || "N/A"; } catch (e) { return "Error."; }
  },

  async analyzeRootCause(trade: Trade): Promise<string> {
      const prompt = `Find ROOT CAUSE of mistake: ${trade.mistakes.join(', ')}. Notes: ${trade.notes}.`;
      try { const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt }); return response.text || "N/A"; } catch (e) { return "Error."; }
  },
  
  async analyzeTalent(answers: any): Promise<TalentScore> {
      const prompt = `Analyze talent from answers: ${JSON.stringify(answers)}. JSON: { total, breakdown: {patience, discipline, resilience, execution}, summary }`;
      try { const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json" } }); return JSON.parse(response.text || '{}'); } catch (e) { return { total: 0, breakdown: { patience: 0, discipline: 0, resilience: 0, execution: 0 }, summary: "Error" }; }
  },

  async analyzePatterns(trades: Trade[]): Promise<string> {
      const prompt = `Analyze patterns in ${trades.length} trades.`;
      try { const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt }); return response.text || "N/A"; } catch (e) { return "Error."; }
  },
  
  async generateIdentity(trades: Trade[]): Promise<{ statement: string, archetype: string }> {
      const prompt = `Construct "Trader Identity". JSON: { archetype, statement }`;
      try { const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json" } }); return JSON.parse(response.text || '{}'); } catch (e) { return { statement: "Error", archetype: "Error" }; }
  },

  async generateSessionPlan(context: string): Promise<SessionPlan> {
      const prompt = `Generate Pre-Session Plan. Context: ${context}. JSON: { bias, focusPoints: [], traps: [], newsEvents: [], memoryAnchor }`;
      try { const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json" } }); return JSON.parse(response.text || '{}'); } catch (e) { return { id: 'error', date: new Date().toISOString(), bias: 'Manual', focusPoints: [], traps: [], newsEvents: [] }; }
  },
  
  async analyzeVoiceLog(transcript: string): Promise<{ emotion: Emotion, summary: string }> {
     const prompt = `Analyze voice note: "${transcript}". JSON: { emotion, summary }`;
     try { const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json" } }); return JSON.parse(response.text || '{}'); } catch (e) { return { emotion: Emotion.NEUTRAL, summary: "Error" }; }
  },
  
  async analyzePsychology(trades: Trade[]): Promise<string> {
     const prompt = `Analyze psychology of ${trades.length} trades.`;
     try { const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt }); return response.text || "N/A"; } catch (e) { return "Error."; }
  },

  async analyzeRegret(trades: Trade[]): Promise<any> { return {}; },
  async generateMarketIdentity(trades: Trade[]): Promise<any> { return {}; },
  async simulateColdState(trade: Trade): Promise<any> { return {}; },
  async calculateFragility(trades: Trade[]): Promise<any> { return {}; },
  async generateQuiz(trade: Trade): Promise<any> { return {}; },
  async analyzeRhythm(trades: Trade[]): Promise<any> { return {}; },
  async reverseEngineer(trade: Trade): Promise<any> { return {}; },
  async generateForecast(trades: Trade[]): Promise<any> { return {}; },
  async analyzeTriggers(trades: Trade[]): Promise<any> { return {}; }
};
