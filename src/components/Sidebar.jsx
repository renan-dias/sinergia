import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useRole } from './RoleContext';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  GraduationCap, 
  Sparkles, 
  BarChart3, 
  Calendar, 
  Code2, 
  ShieldCheck,
  Globe,
  Play,
  PlusCircle,
  UploadCloud,
  BrainCircuit
} from 'lucide-react';

export default function Sidebar() {
  const navigate = useNavigate();
  const { currentRole, setCurrentRole, ROLES } = useRole();

  const navItems = [
    { to: '/dashboard', label: 'Painel Geral', icon: LayoutDashboard },
    { to: '/admin', label: 'Administração EPT', icon: Building2 },
    { to: '/alunos', label: 'Estudantes', icon: Users },
    { to: '/desempenho', label: 'Notas e Faltas', icon: GraduationCap },
    { to: '/ai-reports', label: 'Módulo IA — Parecer', icon: Sparkles, badge: 'IA Core' },
    { to: '/diagnostico', label: 'Diagnóstico IA Aluno', icon: BrainCircuit, badge: 'IA Quiz' },
    { to: '/importar', label: 'Importar Dados', icon: UploadCloud },
    { to: '/insights', label: 'Insights & BNCC', icon: BarChart3 },
    { to: '/calendario', label: 'Calendário Acadêmico', icon: Calendar },
    { to: '/api-docs', label: 'Central REST API', icon: Code2 },
    { to: '/demo', label: 'Sessão Demo (/demo)', icon: Play, badge: 'Demo' },
    { to: '/landing', label: 'Sobre a SinergIA', icon: Globe },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-[260px] bg-white border-r border-slate-200 flex flex-col py-5 px-4 z-20 shadow-sm">
      {/* Brand Header */}
      <div className="mb-4 px-2">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <img src="/favicon.png" alt="SinergIA Favicon Logo" className="w-9 h-9 object-contain rounded-xl shadow-sm" />
          <div>
            <h1 className="font-black text-xl text-brand-600 tracking-tight flex items-center gap-1">
              SinergIA <span className="text-[10px] bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded font-mono font-bold">EPT</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-medium">Gestão Pedagógica Assistida</p>
          </div>
        </div>
      </div>

      {/* Quick Setup School Action */}
      <div className="mb-3">
        <button
          onClick={() => navigate('/setup')}
          className="w-full bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 font-bold px-3 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
        >
          <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>Cadastrar Minha Escola</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                  item.badge === 'Demo' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Role Switcher */}
      <div className="mt-auto pt-3 border-t border-slate-200">
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <div className="flex items-center gap-1.5 mb-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
            <span className="text-[11px] font-semibold text-slate-700">Papel do Usuário</span>
          </div>
          <select
            value={currentRole.id}
            onChange={(e) => {
              const selected = Object.values(ROLES).find(r => r.id === e.target.value);
              if (selected) setCurrentRole(selected);
            }}
            className="w-full text-xs bg-white border border-slate-300 rounded-lg p-1.5 font-medium focus:ring-2 focus:ring-brand-600 focus:border-brand-600 outline-none"
          >
            {Object.values(ROLES).map(role => (
              <option key={role.id} value={role.id}>{role.label}</option>
            ))}
          </select>
        </div>
      </div>
    </aside>
  );
}
