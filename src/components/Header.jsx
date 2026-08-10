import React from 'react';
import { useRole } from './RoleContext';
import { Search, Bell, Sparkles, Shield, Building2 } from 'lucide-react';

export default function Header({ title = 'Painel Geral' }) {
  const { currentRole } = useRole();

  return (
    <header className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between sticky top-0 z-10 shrink-0">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h2>
        <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-medium flex items-center gap-1 border border-slate-200">
          <Building2 className="w-3.5 h-3.5 text-brand-600" />
          IFSULDEMINAS Poços de Caldas
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative w-64 hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Pesquisar aluno, turma..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-full focus:bg-white focus:border-brand-600 focus:ring-1 focus:ring-brand-600 outline-none transition-all"
          />
        </div>

        {/* AI Active Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-200 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span>Gemini 1.5 Flash Ativo</span>
        </div>

        {/* User Role Badge */}
        <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${currentRole.badge} flex items-center gap-1`}>
          <Shield className="w-3 h-3" />
          {currentRole.label}
        </span>

        {/* Notifications */}
        <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-ifred-500 rounded-full"></span>
        </button>
      </div>
    </header>
  );
}
