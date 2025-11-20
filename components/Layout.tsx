
import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Calendar, Brain, Settings, Terminal, Command, PieChart, Target, Library, MessageSquare } from 'lucide-react';
import { CrisisMode } from './CrisisMode';

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => (
  <NavLink 
    to={to} 
    className="relative group block"
  >
    {({ isActive }) => (
      <>
        {isActive && (
          <div className="absolute inset-0 bg-white/5 border-r-2 border-white animate-fade-in origin-left" />
        )}
        <div 
          className={`relative z-10 flex items-center gap-3 px-6 py-3 text-[11px] uppercase tracking-widest font-mono transition-all duration-300 ease-surgical ${
            isActive 
              ? 'text-white pl-8 font-medium' 
              : 'text-gray-600 hover:text-gray-300 hover:bg-white/5 hover:pl-8'
          }`}
        >
          <span className="transition-transform duration-300 ease-surgical group-hover:scale-110 origin-center">
            {icon}
          </span>
          <span className="transition-all duration-300 ease-surgical group-hover:font-medium group-hover:text-white">
            {label}
          </span>
        </div>
      </>
    )}
  </NavLink>
);

export const Layout: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname.split('/')[1] || 'DASHBOARD';

  return (
    <div className="flex h-screen w-full bg-background text-white overflow-hidden font-sans selection:bg-white selection:text-black">
      <CrisisMode />
      
      {/* Sidebar */}
      <aside className="w-64 border-r border-border flex flex-col bg-black z-20">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-2 mb-1 group cursor-default">
             <Command className="w-5 h-5 text-white transition-transform duration-300 ease-surgical group-hover:rotate-90" />
             <h1 className="text-lg font-medium tracking-tight text-white">EQUILIBRIUM</h1>
          </div>
          <div className="flex items-center gap-2 pl-7">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[9px] text-gray-500 font-mono tracking-[0.2em] uppercase">System Online</span>
          </div>
        </div>
        
        <div className="px-6 py-2">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        </div>

        <nav className="flex-1 py-6 space-y-px">
          <NavItem to="/" icon={<LayoutDashboard size={14} />} label="Overview" />
          <NavItem to="/journal" icon={<BookOpen size={14} />} label="Journal" />
          <NavItem to="/calendar" icon={<Calendar size={14} />} label="Timeline" />
          <NavItem to="/library" icon={<Library size={14} />} label="Master Patterns" />
          <div className="pt-4 pb-2 px-6">
             <span className="text-[9px] text-gray-700 font-mono uppercase tracking-widest">Intelligence</span>
          </div>
          <NavItem to="/analysis" icon={<PieChart size={14} />} label="Analysis Lab" />
          <NavItem to="/planning" icon={<Target size={14} />} label="Planning" />
          <NavItem to="/psychology" icon={<Brain size={14} />} label="Psychology" />
          <NavItem to="/companion" icon={<MessageSquare size={14} />} label="AI Companion" />
          <div className="pt-8 pb-2 px-6">
             <span className="text-[9px] text-gray-700 font-mono uppercase tracking-widest">System</span>
          </div>
          <NavItem to="/settings" icon={<Settings size={14} />} label="Config" />
        </nav>

        <div className="p-6 border-t border-border">
           <div className="flex items-center gap-3 text-gray-600 hover:text-white transition-colors duration-300">
              <Terminal size={12} />
              <div className="text-[9px] font-mono tracking-widest">V.3.0.0 NEURAL</div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative flex flex-col">
        {/* Header Bar */}
        <header className="h-14 border-b border-border flex items-center justify-between px-8 bg-black/50 backdrop-blur-sm z-10 shrink-0">
           <div className="text-[10px] font-mono tracking-[0.2em] text-gray-500 uppercase">
              Path // {currentPath.toUpperCase()}
           </div>
           <div className="flex items-center gap-4">
              <div className="h-2 w-2 rounded-full border border-gray-700 transition-all duration-300 hover:bg-gray-700"></div>
              <div className="h-2 w-2 rounded-full border border-gray-700 transition-all duration-300 hover:bg-gray-700"></div>
              <div className="h-2 w-2 rounded-full bg-white animate-pulse-slow"></div>
           </div>
        </header>

        <div className="flex-1 overflow-auto relative scroll-smooth bg-black">
          {/* Subtle Grid Background */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
                backgroundImage: `linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)`,
                backgroundSize: '40px 40px'
            }}
          ></div>
          
          <div className="relative z-10 p-8 min-h-full max-w-7xl mx-auto">
             <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};
