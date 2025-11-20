import React, { InputHTMLAttributes, ButtonHTMLAttributes, TextareaHTMLAttributes, useState, useEffect } from 'react';
import { Loader2, Mic, Square, BarChart2 } from 'lucide-react';

// -- BUTTON --
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, variant = 'primary', size = 'md', isLoading, className = '', ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-mono uppercase tracking-wider transition-all duration-200 ease-surgical focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed rounded-[2px] border active:scale-[0.98]";
  
  const variants = {
    primary: "bg-white text-black border-white hover:bg-gray-200 hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]",
    secondary: "bg-surfaceHighlight text-gray-300 border-border hover:border-gray-500 hover:text-white hover:bg-[#111]",
    danger: "bg-red-950/10 text-red-500 border-red-900/30 hover:bg-red-900/20 hover:border-red-500/50",
    ghost: "bg-transparent text-gray-500 border-transparent hover:text-white hover:bg-white/5",
    outline: "bg-transparent text-gray-400 border-border hover:border-white hover:text-white hover:bg-white/5",
  };

  const sizes = {
    sm: "text-[10px] px-3 py-1.5",
    md: "text-[11px] px-5 py-2.5",
    lg: "text-xs px-8 py-4",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
      {children}
    </button>
  );
};

// -- CARD --
export const Card: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  title?: string; 
  subtitle?: string; 
  hoverEffect?: boolean;
  index?: number;
  rightElement?: React.ReactNode;
}> = ({ children, className = '', title, subtitle, hoverEffect = false, index = 0, rightElement }) => (
  <div 
    className={`bg-[#030303] border border-border/60 p-6 relative overflow-hidden transition-all duration-300 ease-surgical animate-slide-up opacity-0 ${hoverEffect ? 'hover:border-white/20 hover:shadow-[0_4px_20px_rgba(0,0,0,0.5)]' : ''} ${className}`}
    style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
  >
    {(title || subtitle) && (
      <div className="mb-6 border-b border-border/40 pb-4 flex justify-between items-end">
        <div>
          {title && <h3 className="text-white font-medium tracking-tight text-sm">{title}</h3>}
          {subtitle && <p className="text-[10px] text-gray-600 font-mono uppercase tracking-widest mt-1">{subtitle}</p>}
        </div>
        {rightElement ? rightElement : <div className="h-1 w-1 bg-white/20 rounded-full transition-transform duration-500 ease-surgical group-hover:scale-150 group-hover:bg-white"></div>}
      </div>
    )}
    {children}
  </div>
);

// -- INPUT --
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}
export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => (
  <div className="mb-4 group">
    {label && <label className="block text-[9px] text-gray-500 uppercase tracking-widest mb-2 font-mono group-focus-within:text-white transition-colors duration-200 ease-surgical">{label}</label>}
    <input 
      className={`w-full bg-[#080808] border border-border p-3 text-xs text-white focus:border-white/50 outline-none transition-all duration-200 ease-surgical placeholder:text-gray-700 hover:border-white/20 ${className}`} 
      {...props} 
    />
  </div>
);

// -- TEXTAREA --
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}
export const Textarea: React.FC<TextareaProps> = ({ label, className = '', ...props }) => (
  <div className="mb-4 group">
    {label && <label className="block text-[9px] text-gray-500 uppercase tracking-widest mb-2 font-mono group-focus-within:text-white transition-colors duration-200 ease-surgical">{label}</label>}
    <textarea 
      className={`w-full bg-[#080808] border border-border p-3 text-xs text-white focus:border-white/50 outline-none transition-all duration-200 ease-surgical min-h-[100px] placeholder:text-gray-700 hover:border-white/20 ${className}`} 
      {...props} 
    />
  </div>
);

// -- BADGE --
export const Badge: React.FC<{ children: React.ReactNode; variant?: 'default' | 'success' | 'danger' | 'warning' | 'outline' }> = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-surfaceHighlight text-gray-400 border-border',
    success: 'bg-green-950/20 text-green-400 border-green-900/30',
    danger: 'bg-red-950/20 text-red-400 border-red-900/30',
    warning: 'bg-amber-950/20 text-amber-400 border-amber-900/30',
    outline: 'bg-transparent text-gray-500 border-border',
  };
  return (
    <span className={`text-[9px] uppercase tracking-wider font-mono px-2 py-0.5 border ${variants[variant]} transition-colors duration-300 ease-surgical hover:bg-white/5`}>
      {children}
    </span>
  );
};

// -- PROGRESS BAR --
export const ProgressBar: React.FC<{ value: number; max: number; color?: string }> = ({ value, max, color = 'bg-white' }) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    return (
        <div className="h-1.5 w-full bg-[#111] rounded-full overflow-hidden">
            <div 
                className={`h-full ${color} transition-all duration-1000 ease-surgical`} 
                style={{ width: `${percentage}%` }}
            />
        </div>
    );
};

// -- VOICE RECORDER --
export const VoiceRecorder: React.FC<{ onTranscription: (text: string) => void }> = ({ onTranscription }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const speech = new (window as any).webkitSpeechRecognition();
      speech.continuous = true;
      speech.interimResults = true;
      speech.lang = 'en-US';
      speech.onresult = (event: any) => {
         let final = '';
         for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                final += event.results[i][0].transcript;
            }
         }
         if (final) onTranscription(final);
      };
      setRecognition(speech);
    }
  }, [onTranscription]);

  const toggleRecording = () => {
    if (!recognition) return alert("Voice features not supported in this browser.");
    if (isRecording) {
        recognition.stop();
        setIsRecording(false);
    } else {
        recognition.start();
        setIsRecording(true);
    }
  };

  return (
    <button 
        onClick={toggleRecording}
        className={`flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-300 ${isRecording ? 'border-red-500 bg-red-500/10 animate-pulse' : 'border-border bg-[#080808] hover:bg-white/5 hover:border-white/50'}`}
    >
        {isRecording ? <Square size={14} className="text-red-500 fill-current" /> : <Mic size={14} className="text-gray-400" />}
    </button>
  );
};