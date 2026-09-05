import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import MerchantDashboard from './pages/MerchantDashboard';
import SandboxSimulator from './pages/SandboxSimulator';
import DataUpload from './pages/DataUpload';
import OpsManagerDashboard from './pages/OpsManagerDashboard';
import AdminPanel from './pages/AdminPanel';
import CaseDetails from './pages/CaseDetails';
import Analytics from './pages/Analytics';
import LiveAgents from './pages/LiveAgents';
import Settings from './pages/Settings';
import RecoveryQueue from './pages/RecoveryQueue';
import NotFound from './pages/NotFound';
import AgentWorkbench from './pages/AgentWorkbench';
import Transactions from './pages/Transactions';

const ProtectedRoute = ({ children }) => (sessionStorage.getItem('token') || localStorage.getItem('token')) ? children : <Navigate to="/login" replace />;

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        
        {/* Dashboard Routes */}
        <Route path="/dashboard/merchant" element={<ProtectedRoute><MerchantDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/ops" element={<ProtectedRoute><OpsManagerDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
        
        {/* Feature Routes */}
        <Route path="/sandbox" element={<ProtectedRoute><SandboxSimulator /></ProtectedRoute>} />
        <Route path="/upload" element={<ProtectedRoute><DataUpload /></ProtectedRoute>} />
        <Route path="/case/:caseId" element={<ProtectedRoute><CaseDetails /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/live-agents" element={<ProtectedRoute><LiveAgents /></ProtectedRoute>} />
        <Route path="/agent-workbench" element={<ProtectedRoute><AgentWorkbench /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/recovery-queue" element={<ProtectedRoute><RecoveryQueue /></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
        <Route path="/cases" element={<ProtectedRoute><RecoveryQueue /></ProtectedRoute>} />
        <Route path="/revenue-risk" element={<ProtectedRoute><RecoveryQueue /></ProtectedRoute>} />
        <Route path="/agents" element={<ProtectedRoute><LiveAgents /></ProtectedRoute>} />
        
        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;