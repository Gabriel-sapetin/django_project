/**
 * Main App Component - Matches Haidee's BATAC Farm layout
 */

import React, { useState, useEffect } from 'react';
import './App.css';
import { Dashboard } from './components/Dashboard';
import { Animals } from './components/Animals';
import { EggProduction } from './components/EggProduction';
import { FeedStock } from './components/FeedStock';
import { MortalitySummary } from './components/MortalitySummary';
import { ReportActivities } from './components/ReportActivities';
import { SettingsProfile } from './components/SettingsProfile';
import { Login } from './components/Login';
import { getAuth, clearAuth, notificationAPI } from './services/apiService';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  useEffect(() => {
    const { token, user: savedUser } = getAuth();
    if (token && savedUser) {
      setUser(savedUser);
    }
  }, []);

  useEffect(() => {
    if (user) {
      notificationAPI.getUnreadCount()
        .then(res => setUnreadNotifs(res.data?.unread_count || 0))
        .catch(() => {});
    }
  }, [user, currentPage]);

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    clearAuth();
    setUser(null);
    setCurrentPage('dashboard');
  };

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'animals':
        return <Animals />;
      case 'egg-production':
        return <EggProduction />;
      case 'feed-stock':
        return <FeedStock />;
      case 'mortality':
        return <MortalitySummary />;
      case 'reports':
        return <ReportActivities />;
      case 'settings':
        return <SettingsProfile onNavigate={setCurrentPage} />;
      default:
        return <Dashboard />;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'animals', label: 'Animals & Eggs', icon: '🐔' },
    { id: 'egg-production', label: 'Egg Production', icon: '🥚' },
    { id: 'feed-stock', label: 'Feed Stock', icon: '🌾' },
    { id: 'mortality', label: 'Mortality Summary', icon: '⚠️' },
    { id: 'reports', label: 'Report with Proof Activities', icon: '📋' },
    { id: 'settings', label: 'Settings and Profile', icon: '⚙️' },
  ];

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-brand">
          <span className="brand-icon">🌾</span>
          <span className="brand-text">BATAC Farm</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => setCurrentPage(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Area */}
      <div className="main-area">
        {/* Top Header Bar */}
        <header className="app-header">
          <div className="header-left">
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              ☰
            </button>
            <div className="header-brand">
              <span className="header-brand-icon">🌾</span>
              <span className="header-brand-text">Farm Mgmt</span>
            </div>
          </div>
          <div className="header-right">
            <button className="notif-btn" onClick={() => setCurrentPage('dashboard')}>
              🔔
              {unreadNotifs > 0 && <span className="notif-badge">{unreadNotifs}</span>}
            </button>
            <div className="user-info">
              <div className="user-avatar">
                {(user.first_name || user.username || '?')[0].toUpperCase()}
              </div>
              <div className="user-details">
                <span className="user-name">{user.username}</span>
                <span className="user-role">Owner</span>
              </div>
            </div>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </header>

        {/* Page Content */}
        <main className="main-content">
          <div className="page-container">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
