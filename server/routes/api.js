import express from 'express';
import adminRoutes from './admin.js';
import studentRoutes from './students.js';
import gradeRoutes from './grades.js';
import aiReportRoutes from './aiReports.js';
import attendanceRoutes from './attendance.js';
import calendarRoutes from './calendar.js';
import analyticsRoutes from './analytics.js';
import importRoutes from './import.js';
import diagnosticRoutes from './diagnostic.js';

const router = express.Router();

router.use('/', adminRoutes);
router.use('/alunos', studentRoutes);
router.use('/desempenho', gradeRoutes);
router.use('/ai-reports', aiReportRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/calendar', calendarRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/import', importRoutes);
router.use('/ai-diagnostic', diagnosticRoutes);

// Healthcheck & Version info
router.get('/info', (req, res) => {
  res.json({
    app: 'SinergIA EPT — Sistema de Informação Gerencial Pedagógico com IA',
    version: '1.0.0',
    status: 'operational',
    documentation: '/api-docs',
    timestamp: new Date().toISOString()
  });
});

export default router;
