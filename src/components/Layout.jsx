import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const pageTitles = {
  '/dashboard': 'Painel Geral',
  '/admin': 'Administração EPT & BNCC',
  '/alunos': 'Gestão de Estudantes',
  '/desempenho': 'Lançamento de Notas e Faltas',
  '/ai-reports': 'Módulo de IA — Parecer Pedagógico',
  '/insights': 'Insights e Tendências Pedagógicas',
  '/calendario': 'Calendário Acadêmico Vivo',
  '/api-docs': 'Central da REST API Internal',
  '/landing': 'Sobre a SinergIA'
};

export default function Layout() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'SinergIA EPT';

  return (
    <div className="min-h-screen flex bg-surface">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-[260px] min-w-0">
        <Header title={title} />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
