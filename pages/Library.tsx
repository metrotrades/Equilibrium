
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, Button, Input, Textarea, Badge } from '../components/UIComponents';
import { Library as LibIcon, Plus, Image as ImageIcon, Trash2 } from 'lucide-react';
import { MasterPattern } from '../types';

export const Library: React.FC = () => {
  const { patterns, addPattern } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [newPattern, setNewPattern] = useState<Partial<MasterPattern>>({ name: '', description: '', rules: [] });
  const [ruleInput, setRuleInput] = useState("");

  const handleAddRule = () => {
      if (ruleInput) {
          setNewPattern({ ...newPattern, rules: [...(newPattern.rules || []), ruleInput] });
          setRuleInput("");
      }
  };

  const handleSave = () => {
      if(!newPattern.name) return;
      addPattern({
          id: crypto.randomUUID(),
          name: newPattern.name!,
          description: newPattern.description || '',
          rules: newPattern.rules || [],
          winRate: 0
      });
      setIsAdding(false);
      setNewPattern({ name: '', description: '', rules: [] });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end border-b border-white/5 pb-6">
         <div>
            <h2 className="text-xl font-light tracking-tight text-white">Master Pattern Library</h2>
            <p className="text-[10px] font-mono text-gray-600 mt-1 uppercase tracking-widest">Your Edge Repository</p>
         </div>
         <Button onClick={() => setIsAdding(true)} variant="primary" size="sm">
             <Plus className="w-3 h-3 mr-2" /> ADD PATTERN
         </Button>
      </div>

      {isAdding && (
          <Card className="mb-8 animate-slide-up border-white/20">
              <div className="space-y-4">
                  <Input label="Pattern Name" value={newPattern.name} onChange={e => setNewPattern({...newPattern, name: e.target.value})} />
                  <Textarea label="Description / Context" value={newPattern.description} onChange={e => setNewPattern({...newPattern, description: e.target.value})} />
                  
                  <div>
                      <div className="flex gap-2 mb-2">
                          <Input placeholder="Add Rule (e.g. Must sweep liquidity)" value={ruleInput} onChange={e => setRuleInput(e.target.value)} className="mb-0" />
                          <Button onClick={handleAddRule}>ADD</Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                          {newPattern.rules?.map((r, i) => (
                              <Badge key={i} variant="outline">{r}</Badge>
                          ))}
                      </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 mt-4">
                      <Button variant="ghost" onClick={() => setIsAdding(false)}>CANCEL</Button>
                      <Button onClick={handleSave}>SAVE PATTERN</Button>
                  </div>
              </div>
          </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {patterns.length === 0 && (
              <div className="col-span-3 text-center py-20 border border-dashed border-white/10">
                  <LibIcon size={32} className="mx-auto text-gray-700 mb-4" />
                  <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">Library Empty</p>
              </div>
          )}
          {patterns.map(p => (
              <div key={p.id} className="bg-[#050505] border border-border p-6 hover:border-white/30 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                      <h3 className="text-white font-mono font-bold">{p.name}</h3>
                      <Badge variant="default">EDGE</Badge>
                  </div>
                  <p className="text-xs text-gray-400 font-mono mb-4 min-h-[40px]">{p.description}</p>
                  
                  <div className="space-y-2 mb-6">
                      {p.rules.slice(0, 3).map((r, i) => (
                          <div key={i} className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                              <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                              {r}
                          </div>
                      ))}
                  </div>
                  
                  <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                      <span className="text-[9px] text-gray-600 uppercase tracking-widest">Win Rate: --%</span>
                      <Button variant="ghost" size="sm" className="text-[9px]">DETAILS</Button>
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
};
