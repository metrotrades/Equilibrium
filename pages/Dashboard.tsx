
import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Card, Badge } from '../components/UIComponents';
import { TradeResult } from '../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Activity, BarChart3 } from 'lucide-react';
import { RiskGuardrail } from '../components/RiskGuardrail';

const StatCard: React.FC<{ label: string; value: string | number; subvalue?: string; trend?: 'up' | 'down'; index?: number }> = ({ label, value, subvalue, trend, index = 0 }) => (
  <div 
    className="bg-[#050505] border border-border/50 p-5 flex flex-col justify-between transition-all duration-300 ease-surgical hover:border-white/20 hover:-translate-y-1 hover:bg-[#0A0A0A] group cursor-default animate-slide-up opacity-0"
    style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
  >
    <div className="flex justify-between items-start mb-4">
      <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-gray-600 group-hover:text-gray-400 transition-colors duration-300">{label}</span>
      {trend === 'up' ? <ArrowUpRight size={14} className="text-white transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" /> : trend === 'down' ? <ArrowDownRight size={14} className="text-gray-600 transition-transform duration-300 group-hover:translate-x-1 group-hover:translate-y-1" /> : null}
    </div>
    <div>
       <div className="text-2xl font-light text-white tracking-tight">{value}</div>
       {subvalue && <div className="text-[10px] text-gray-600 font-mono mt-1 group-hover:text-gray-500 transition-colors">{subvalue}</div>}
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  const { trades, profile } = useApp();

  const stats = useMemo(() => {
    const closedTrades = trades.filter(t => t.result !== undefined);
    const totalTrades = closedTrades.length;
    const wins = closedTrades.filter(t => t.result === TradeResult.WIN).length;
    const winRate = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(1) : '0.0';
    const totalPnL = closedTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
    const totalR = closedTrades.reduce((acc, t) => acc + (t.rMultiple || 0), 0);
    
    let runningBalance = profile.accountBalance;
    const equityData = closedTrades
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((t, i) => {
        runningBalance += (t.pnl || 0);
        return { i: i+1, date: t.date, balance: runningBalance };
      });

    if (equityData.length === 0) equityData.push({ i: 0, date: new Date().toISOString(), balance: profile.accountBalance });
      
    return { totalTrades, winRate, totalPnL, totalR, equityData };
  }, [trades, profile]);

  return (
    <div className="space-y-8 -mt-8 -mx-8">
      {/* Risk HUD */}
      <RiskGuardrail />
      
      <div className="px-8 pb-8 space-y-8">
          <div className="flex justify-between items-end border-b border-white/5 pb-6 animate-slide-up mt-8">
            <div>
              <h2 className="text-xl font-light tracking-tight text-white">Mission Control</h2>
              <div className="flex items-center gap-2 mt-2">
                <div className="h-px w-8 bg-gray-800"></div>
                <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Live Data Feed</p>
              </div>
            </div>
            <div className="text-right">
               <div className="text-[10px] text-gray-600 font-mono uppercase tracking-widest mb-1">Total Equity</div>
               <div className="text-3xl font-light text-white">${(profile.accountBalance + stats.totalPnL).toLocaleString()}</div>
            </div>
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-border/50 border border-border/50">
            <StatCard index={1} label="Win Rate" value={`${stats.winRate}%`} subvalue="Last 30 Days" trend={parseFloat(stats.winRate) > 50 ? 'up' : 'down'} />
            <StatCard index={2} label="Net PnL" value={`$${stats.totalPnL.toLocaleString()}`} subvalue={stats.totalPnL >= 0 ? 'Profitable' : 'Drawdown'} trend={stats.totalPnL >= 0 ? 'up' : 'down'} />
            <StatCard index={3} label="R-Factor" value={`${stats.totalR.toFixed(2)}R`} subvalue="Accumulated" />
            <StatCard index={4} label="Total Trades" value={stats.totalTrades} subvalue="Executions" />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card index={5} className="lg:col-span-2 h-[400px]" title="Equity Curve" subtitle="Account Growth Performance" hoverEffect>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.equityData} margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                  <XAxis dataKey="i" stroke="#333" fontSize={10} tickLine={false} axisLine={false} tick={{fill: '#666', fontFamily: 'JetBrains Mono'}} />
                  <YAxis stroke="#333" fontSize={10} tickLine={false} axisLine={false} tick={{fill: '#666', fontFamily: 'JetBrains Mono'}} domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '0px', padding: '8px' }}
                    itemStyle={{ color: '#fff', fontFamily: 'JetBrains Mono', fontSize: '11px' }}
                    cursor={{ stroke: '#333', strokeWidth: 1 }}
                  />
                  <Line 
                    type="stepAfter" 
                    dataKey="balance" 
                    stroke="#fff" 
                    strokeWidth={1} 
                    dot={{ r: 2, fill: '#000', stroke: '#fff', strokeWidth: 1 }} 
                    activeDot={{ r: 4, fill: '#fff' }} 
                    isAnimationActive={true}
                    animationBegin={500}
                    animationDuration={2000}
                    animationEasing="ease-out"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <div className="space-y-6">
               <Card index={6} className="h-full" title="Recent Logs" subtitle="Latest Executions" hoverEffect>
                  <div className="space-y-px bg-border/30 border border-border/30">
                     {trades.slice(0, 6).map((trade, idx) => (
                        <div 
                            key={trade.id} 
                            className="flex justify-between items-center p-3 bg-[#050505] hover:bg-white/5 transition-all duration-200 ease-surgical group border-l-2 border-transparent hover:border-white hover:pl-4"
                            style={{ animationDelay: `${(idx + 6) * 50}ms` }}
                        >
                           <div className="flex items-center gap-3">
                              <div className={`w-1 h-8 transition-all duration-300 ${trade.result === TradeResult.WIN ? 'bg-white group-hover:bg-green-400' : trade.result === TradeResult.LOSS ? 'bg-gray-800 group-hover:bg-red-900' : 'bg-gray-600'}`}></div>
                              <div>
                                 <div className="text-[11px] font-bold text-white font-mono">{trade.pair}</div>
                                 <div className="text-[9px] text-gray-600 font-mono uppercase group-hover:text-gray-400 transition-colors">{trade.direction} // {trade.date.slice(5)}</div>
                              </div>
                           </div>
                           <div className="text-right">
                              <div className="font-mono text-[11px] text-white">{trade.rMultiple}R</div>
                              <Badge variant={trade.result === TradeResult.WIN ? 'outline' : 'outline'}>{trade.result || 'OPEN'}</Badge>
                           </div>
                        </div>
                     ))}
                     {trades.length === 0 && <div className="text-gray-700 text-xs font-mono text-center py-12">NO DATA AVAILABLE</div>}
                  </div>
               </Card>
            </div>
          </div>
      </div>
    </div>
  );
};
