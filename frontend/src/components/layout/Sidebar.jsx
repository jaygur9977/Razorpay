import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Activity, Bot, FileText,
  BarChart3, Settings, LogOut, Zap,
  Shield, TrendingUp, Clock, AlertCircle,
  ChevronLeft, ChevronRight, Menu, Users
} from 'lucide-react';

const Sidebar = ({ role, isCollapsed, toggleSidebar }) => {
  const navigate = useNavigate();

  const menuItems = {
    merchant: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard/merchant' },
      { icon: FileText, label: 'Transactions', path: '/transactions' },
      { icon: Activity, label: 'Revenue at Risk', path: '/revenue-risk' },
      { icon: Bot, label: 'AI Agent Status', path: '/agents' },
      { icon: FileText, label: 'Recovery Cases', path: '/cases' },
      { icon: BarChart3, label: 'Analytics', path: '/analytics' },
      { icon: Settings, label: 'Settings', path: '/settings' },
    ],
    ops_manager: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard/ops' },
      { icon: AlertCircle, label: 'Escalations', path: '/escalations', badge: 3 },
      { icon: Clock, label: 'Active Queue', path: '/queue' },
      { icon: Bot, label: 'Agent Monitor', path: '/agents' },
      { icon: BarChart3, label: 'Performance', path: '/performance' },
    ],
    admin: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard/admin' },
      { icon: Shield, label: 'Policies', path: '/policies' },
      { icon: Users, label: 'Users', path: '/users' },
      { icon: Settings, label: 'System Config', path: '/config' },
    ],
    demo_tester: [
      { icon: Zap, label: 'Simulator', path: '/sandbox' },
      { icon: Activity, label: 'Live Agents', path: '/live-agents' },
      { icon: Bot, label: 'Agent Reasoning', path: '/agent-workbench' },
      { icon: TrendingUp, label: 'Test Results', path: '/test-results' },
    ],
  };

  const items = menuItems[role] || menuItems.merchant;

  const user = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed left-0 top-0 h-full bg-gray-900/50 backdrop-blur-xl border-r border-white/10 transition-all duration-300 z-40 ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="font-bold font-display text-lg">RevArb AI</h1>
              <p className="text-xs text-white/40">Recovery Platform</p>
            </div>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className="text-white/40 hover:text-white/80 transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative group ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white border border-indigo-500/30'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-r-full"
                    />
                  )}
                  <Icon className="w-5 h-5 shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-sm font-medium">{item.label}</span>
                      {item.badge && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
            <span className="text-white font-bold">{(user.name || '--').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span>
          </div>
          {!isCollapsed && (
            <div className="flex-1">
              <p className="text-sm font-medium">{user.name || 'Account'}</p>
              <p className="text-xs text-white/40 capitalize">{role.replace('_', ' ')}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="text-white/40 hover:text-red-400 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;