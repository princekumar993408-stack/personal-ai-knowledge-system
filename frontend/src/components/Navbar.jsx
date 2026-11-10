import React from 'react';
import { Brain, Network, BookOpen, MessageSquareCode, BarChart3, ShieldCheck } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onNewNote }) {
  const navItems = [
    { id: 'notes', label: 'Notes Hub', icon: BookOpen },
    { id: 'graph', label: 'Knowledge Graph', icon: Network },
    { id: 'ask', label: 'Semantic Ask & Citations', icon: MessageSquareCode },
    { id: 'analytics', label: 'Memory Analytics', icon: BarChart3 },
  ];

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-500 shadow-lg shadow-purple-500/20">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-purple-300 bg-clip-text text-transparent">
                  CortexPKM
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono">
                  v2.0 • Local AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Personal AI Knowledge Management System</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 sm:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-sm shadow-purple-900/50'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-slate-500'}`} />
                  <span className="hidden md:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action / Author */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onNewNote}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white shadow-md shadow-purple-600/20 transition-all active:scale-95"
            >
              <span>+ New Note</span>
            </button>
            <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>princekumar993408-stack</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
