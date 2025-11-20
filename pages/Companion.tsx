
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ChatMessage } from '../types';
import { geminiService } from '../services/geminiService';
import { Button, Input } from '../components/UIComponents';
import { Send, User, Cpu, Sparkles } from 'lucide-react';

export const Companion: React.FC = () => {
    const { profile } = useApp();
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: '1', sender: 'AI', text: `I am online. Current Persona: ${profile.mentorPersona}. How are you holding up?`, timestamp: Date.now() }
    ]);
    const [inputText, setInputText] = useState("");
    const [typing, setTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if(scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    const sendMessage = async () => {
        if(!inputText.trim()) return;
        
        const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'USER', text: inputText, timestamp: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setInputText("");
        setTyping(true);

        const aiResponseText = await geminiService.chatWithCompanion(messages, inputText, profile);
        
        const aiMsg: ChatMessage = { id: (Date.now()+1).toString(), sender: 'AI', text: aiResponseText, timestamp: Date.now() };
        setMessages(prev => [...prev, aiMsg]);
        setTyping(false);
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col animate-fade-in -mt-4">
             <div className="flex justify-between items-end border-b border-white/5 pb-4 mb-4 shrink-0">
                <div>
                    <h2 className="text-xl font-light tracking-tight text-white flex items-center gap-3">
                        <Sparkles className="text-blue-400" size={18}/> AI Companion
                    </h2>
                    <p className="text-[10px] font-mono text-gray-600 mt-1 uppercase tracking-widest">
                        Trading Therapist // Execution Coach
                    </p>
                </div>
                <div className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[10px] text-gray-400 font-mono">
                    Persona: <span className="text-white">{profile.mentorPersona}</span>
                </div>
             </div>

             {/* Chat Area */}
             <div className="flex-1 overflow-y-auto space-y-6 pr-4 mb-4" ref={scrollRef}>
                 {messages.map(msg => (
                     <div key={msg.id} className={`flex gap-4 ${msg.sender === 'USER' ? 'flex-row-reverse' : ''}`}>
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${msg.sender === 'USER' ? 'bg-white/10 border-white/20' : 'bg-blue-900/20 border-blue-500/30'}`}>
                             {msg.sender === 'USER' ? <User size={14} /> : <Cpu size={14} className="text-blue-400" />}
                         </div>
                         <div className={`max-w-[70%] p-4 text-sm font-mono leading-relaxed border ${msg.sender === 'USER' ? 'bg-[#0A0A0A] border-white/10 text-gray-300' : 'bg-blue-950/10 border-blue-900/30 text-blue-100'}`}>
                             {msg.text}
                         </div>
                     </div>
                 ))}
                 {typing && (
                     <div className="flex gap-4">
                         <div className="w-8 h-8 rounded-full bg-blue-900/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                             <Cpu size={14} className="text-blue-400 animate-pulse" />
                         </div>
                         <div className="text-xs text-gray-600 font-mono py-2">Typing...</div>
                     </div>
                 )}
             </div>

             {/* Input Area */}
             <div className="shrink-0 pt-4 border-t border-white/10">
                 <div className="flex gap-3">
                     <Input 
                        value={inputText} 
                        onChange={e => setInputText(e.target.value)} 
                        onKeyDown={e => e.key === 'Enter' && sendMessage()}
                        placeholder="Vent, ask for advice, or analyze a feeling..." 
                        className="mb-0"
                     />
                     <Button onClick={sendMessage} disabled={typing || !inputText}>
                         <Send size={14} />
                     </Button>
                 </div>
             </div>
        </div>
    );
};
