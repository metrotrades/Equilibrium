import React from 'react';
import { useApp } from '../context/AppContext';
import { TradeResult } from '../types';

export const Calendar: React.FC = () => {
  const { trades } = useApp();
  
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const currentDate = new Date();
  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const daysArray = [...Array(daysInMonth).keys()].map(i => i + 1);
  const blanks = [...Array(firstDayOfMonth).keys()];

  const getTradesForDay = (day: number) => {
    return trades.filter(t => {
      const d = new Date(t.date);
      return d.getDate() === day && d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
    });
  };

  return (
    <div className="animate-fade-in h-full flex flex-col">
      <div className="flex justify-between items-end border-b border-white/5 pb-6 mb-8">
         <div>
            <h2 className="text-xl font-light tracking-tight text-white">Timeline</h2>
            <p className="text-[10px] font-mono text-gray-600 mt-1 uppercase tracking-widest">Execution History & PNL Distribution</p>
         </div>
         <div className="text-white font-mono text-sm tracking-widest border border-white/10 px-3 py-1 hover:bg-white/5 transition-colors duration-300 cursor-default">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase()}
         </div>
      </div>

      <div className="grid grid-cols-7 border-l border-t border-white/10 bg-black">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
           <div key={d} className="p-3 text-center text-[9px] font-mono text-gray-600 uppercase tracking-widest border-r border-b border-white/10 bg-[#030303]">{d}</div>
        ))}
        
        {blanks.map(b => <div key={`blank-${b}`} className="bg-[#050505] border-r border-b border-white/10" />)}
        
        {daysArray.map(day => {
           const dayTrades = getTradesForDay(day);
           const netPnL = dayTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
           const hasTrades = dayTrades.length > 0;
           const isPositive = netPnL >= 0;
           
           return (
              <div key={day} className="bg-black p-3 min-h-[120px] border-r border-b border-white/10 relative group hover:bg-white/5 transition-all duration-200 ease-surgical">
                 <span className="text-[10px] text-gray-700 font-mono group-hover:text-white transition-colors duration-200">{day}</span>
                 
                 {hasTrades && (
                    <div className="mt-2 animate-fade-in">
                       <div className={`text-sm font-mono mb-1 transition-colors duration-300 ${isPositive ? 'text-white' : 'text-gray-500 group-hover:text-red-400'}`}>
                          {isPositive ? '+' : ''}{netPnL}
                       </div>
                       <div className="flex flex-wrap gap-1">
                          {dayTrades.map((t, i) => (
                             <div 
                                key={i} 
                                className={`w-1.5 h-1.5 rounded-full transition-transform duration-300 group-hover:scale-110 ${t.result === TradeResult.WIN ? 'bg-white' : 'bg-gray-800'}`}
                                style={{ transitionDelay: `${i * 50}ms` }}
                             />
                          ))}
                       </div>
                    </div>
                 )}
                 
                 {/* Hover Detail */}
                 {hasTrades && (
                    <div className="absolute inset-0 bg-black border border-white/20 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 ease-surgical origin-bottom z-10 p-3 flex flex-col justify-center pointer-events-none backdrop-blur-sm bg-black/90">
                        <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Daily Net</div>
                        <div className="text-white font-mono text-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">{netPnL}</div>
                        <div className="h-px w-full bg-gray-800 my-2 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                        <div className="text-[9px] text-gray-400">{dayTrades.length} Executions</div>
                    </div>
                 )}
              </div>
           );
        })}
      </div>
    </div>
  );
};