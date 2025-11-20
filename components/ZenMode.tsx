
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ZenModeProps {
    initialText: string;
    onClose: (text: string) => void;
}

export const ZenMode: React.FC<ZenModeProps> = ({ initialText, onClose }) => {
    const [text, setText] = useState(initialText);
    const [breathingState, setBreathingState] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setBreathingState(prev => !prev);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 bg-black z-[100] animate-fade-in flex flex-col items-center justify-center">
            {/* Breathing Background */}
            <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-[4000ms] ease-in-out ${breathingState ? 'opacity-30' : 'opacity-10'}`}>
                <div className="w-[600px] h-[600px] rounded-full bg-gradient-to-b from-blue-900/20 to-transparent blur-[100px]"></div>
            </div>

            <button 
                onClick={() => onClose(text)} 
                className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors z-50"
            >
                <X size={24} />
            </button>

            <div className="relative z-10 w-full max-w-3xl px-8">
                <div className="text-center mb-12">
                    <span className="text-[10px] font-mono text-gray-600 uppercase tracking-[0.3em] animate-pulse-slow">Zen Mode // Focus</span>
                </div>
                
                <textarea 
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Clear your mind..."
                    className="w-full h-[60vh] bg-transparent border-none text-xl md:text-2xl font-serif text-gray-300 placeholder:text-gray-800 focus:outline-none focus:ring-0 resize-none text-center leading-loose selection:bg-white/20"
                    autoFocus
                />
            </div>
        </div>
    );
};
