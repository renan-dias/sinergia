import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RoleProvider } from './components/RoleContext';
import Layout from './components/Layout';
import SchoolSetupWizard from './pages/SchoolSetupWizard';
import DemoPage from './pages/DemoPage';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import AdminPage from './pages/AdminPage';
import StudentsPage from './pages/StudentsPage';
import PerformancePage from './pages/PerformancePage';
import AIReportsPage from './pages/AIReportsPage';
import InsightsPage from './pages/InsightsPage';
import CalendarPage from './pages/CalendarPage';
import ApiDocsPage from './pages/ApiDocsPage';
import ImportPage from './pages/ImportPage';
import DiagnosticPage from './pages/DiagnosticPage';

export default function App() {
  return (
    <RoleProvider>
      <BrowserRouter>
        <Routes>
          {/* Onboarding Setup Route (Full Screen) */}
          <Route path="/setup" element={<SchoolSetupWizard />} />

          {/* Main App Layout */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="demo" element={<DemoPage />} />
            <Route path="landing" element={<LandingPage />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="admin" element={<AdminPage />} />
            <Route path="alunos" element={<StudentsPage />} />
            <Route path="desempenho" element={<PerformancePage />} />
            <Route path="ai-reports" element={<AIReportsPage />} />
            <Route path="insights" element={<InsightsPage />} />
            <Route path="calendario" element={<CalendarPage />} />
            <Route path="api-docs" element={<ApiDocsPage />} />
            <Route path="importar" element={<ImportPage />} />
            <Route path="diagnostico" element={<DiagnosticPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </RoleProvider>
  );
}
