import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Search, Sun, Moon, Menu, Zap } from 'lucide-react';

const TopBar = ({ 
  title, 
  subtitle, 
  onMenuClick, 
  isDark, 
  toggleTheme,
  notifications = []
}) => {
  const [showNotifications, setShowNotifications] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 bg-gray-950/50 backdrop-blur-xl border-b border-white/10">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-white/60 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold font-display"
            >
              {title}
            </motion.h1>
            {subtitle && (
              <p className="text-sm text-white/50">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="hidden md:flex items-center relative">
            <Search className="absolute left-3 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search..."
              className="input-primary pl-10 pr-4 py-2 w-64"
            />
          </div>

          {/* Live Indicator */}
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs font-medium text-emerald-400">Live</span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            {isDark ? <Sun className="w-5 h-5 text-white/60" /> : <Moon className="w-5 h-5 text-white/60" />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors relative"
            >
              <Bell className="w-5 h-5 text-white/60" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="absolute right-0 mt-2 w-80 glass-card p-4 max-h-96 overflow-y-auto"
              >
                <h3 className="font-semibold mb-3">Notifications</h3>
                {notifications.length === 0 ? (
                  <p className="text-sm text-white/40">No new notifications</p>
                ) : (
                  notifications.map((notif, i) => (
                    <div key={i} className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
                      <div className="p-2 bg-indigo-500/20 rounded-lg">
                        <Zap className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{notif.title}</p>
                        <p className="text-xs text-white/40">{notif.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </div>

          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center cursor-pointer">
            <span className="text-white font-bold">JD</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;