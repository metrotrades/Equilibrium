
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, Button, Input, Badge } from '../components/UIComponents';
import { Target, FileSignature, Shield } from 'lucide-react';
import { RuleTier } from '../types';

export const Planning: React.FC = () => {
  const { profile, saveProfile } = useApp();
  const [ruleInput, setRuleInput] = useState("");
  const [ruleTier, setRuleTier] = useState<RuleTier>(RuleTier.TIER_1);
  const [goalInput, setGoalInput] = useState("");
  
  const addRule = () => {
      if(!ruleInput) return;
      const newRule = { id: crypto.randomUUID(), text: ruleInput, tier: ruleTier, breaks: 0 };
      const currentRules = profile.rules || [];
      saveProfile({ ...profile, rules: [...currentRules, newRule] });
      setRuleInput("");
  };

  const addGoal = () => {
      if(!goalInput) return;
      const newGoal = { id: crypto.randomUUID(), term: '90_DAY' as const, goal: goalInput, progress: 0 };
      const currentGoals = profile.identityGoals || [];
      saveProfile({ ...profile, identityGoals: [...currentGoals, newGoal] });
      setGoalInput("");
  };

  return (
    <div className="space-y-8 animate-fade-in">
       <div className="flex justify-between items-end border-b border-white/5 pb-6">
         <div>
            <h2 className="text-xl font-light tracking-tight text-white">Mission Planning</h2>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Rule Hierarchy */}
          <Card title="Rule Hierarchy" subtitle="Tiered System" hoverEffect rightElement={<Shield size={14}/>}>
              <div className="space-y-4">
                  <div className="flex gap-2">
                      <select 
                        className="bg-black border border-border text-[10px] text-white"
                        value={ruleTier}
                        onChange={e => setRuleTier(e.target.value as RuleTier)}
                      >
                          <option value={RuleTier.TIER_1}>TIER 1 (IRONCLAD)</option>
                          <option value={RuleTier.TIER_2}>TIER 2 (IMPORTANT)</option>
                          <option value={RuleTier.TIER_3}>TIER 3 (OPTIMAL)</option>
                      </select>
                      <Input placeholder="New Rule..." value={ruleInput} onChange={e => setRuleInput(e.target.value)} className="mb-0 flex-1" />
                      <Button onClick={addRule} size="sm">ADD</Button>
                  </div>

                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {(profile.rules || []).map(rule => (
                          <div key={rule.id} className="flex items-center justify-between p-3 border border-border bg-[#080808]">
                              <div className="flex items-center gap-3">
                                  <div className={`w-1 h-full self-stretch ${rule.tier === RuleTier.TIER_1 ? 'bg-red-500' : rule.tier === RuleTier.TIER_2 ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                                  <span className="text-xs font-mono text-white">{rule.text}</span>
                              </div>
                              <Badge variant="outline">{rule.tier}</Badge>
                          </div>
                      ))}
                  </div>
              </div>
          </Card>

          {/* Identity Goals */}
          <Card title="Identity Engineering" subtitle="90 Day Targets" hoverEffect rightElement={<Target size={14}/>}>
              <div className="space-y-4">
                  <div className="flex gap-2">
                      <Input placeholder="New Identity Goal..." value={goalInput} onChange={e => setGoalInput(e.target.value)} className="mb-0 flex-1" />
                      <Button onClick={addGoal} size="sm">SET</Button>
                  </div>
                  <div className="space-y-2">
                      {(profile.identityGoals || []).map(g => (
                          <div key={g.id} className="p-4 border border-white/10 bg-[#080808]">
                              <div className="text-[9px] text-gray-500 uppercase mb-1">{g.term.replace('_', ' ')}</div>
                              <div className="text-sm font-serif italic text-white">"{g.goal}"</div>
                          </div>
                      ))}
                  </div>
              </div>
          </Card>
      </div>
    </div>
  );
};
