import React from 'react';
import { useRole } from './RoleContext';
import { Search, Bell, Sparkles, Shield, FlaskConical } from 'lucide-react';

export default function Header({ title = 'Painel Geral' }) {
  const { currentRole } = useRole();

  return (
    <header className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between sticky top-0 z-10 shrink-0">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h2>
        {/* Selo de versão alfa — o tooltip aparece no hover e também no foco por teclado */}
        <div className="relative group">
          <span
            tabIndex={0}
            role="button"
            aria-describedby="alpha-tooltip"
            className="text-xs bg-amber-50 text-amber-800 px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 border border-amber-300 cursor-help outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <FlaskConical className="w-3.5 h-3.5 text-amber-600" />
            Versão Alfa
          </span>

          <div
            id="alpha-tooltip"
            role="tooltip"
            className="pointer-events-none absolute left-0 top-full mt-2 w-72 rounded-lg bg-slate-900 p-3 text-xs leading-relaxed text-slate-200 shadow-xl ring-1 ring-black/10 opacity-0 invisible translate-y-1 transition-all duration-150 z-30 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:visible group-focus-within:opacity-100 group-focus-within:translate-y-0"
          >
            <span className="absolute -top-1 left-4 h-2 w-2 rotate-45 bg-slate-900"></span>
            <p className="font-semibold text-white mb-1">Versão alfa — protótipo em desenvolvimento</p>
            <p>
              Build experimental, publicada apenas para testes e validação de conceito. Telas, dados e
              funcionalidades ainda estão sendo construídos e podem mudar, falhar ou ser removidos sem aviso.
            </p>
            <p className="mt-1.5 text-amber-300">
              Não representa a versão final do sistema, e os dados exibidos são fictícios.
            </p>
          </div>
        </div>
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
