/**
 * Egg Production Component - Matches Haidee's egg_production page
 */

import React, { useState, useEffect } from 'react';
import { useFetch } from '../hooks';
import { eggProductionAPI, activityAPI } from '../services/apiService';
import './EggProduction.css';

export const EggProduction = () => {
  const { data: productions, loading } = useFetch('/egg-production/');
  const [weeklyTotal, setWeeklyTotal] = useState(0);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    // Fetch weekly summary
    eggProductionAPI.getWeeklySummary()
      .then(res => {
        const data = res.data;
        if (Array.isArray(data)) {
          const total = data.reduce((sum, d) => sum + (d.total || 0), 0);
          setWeeklyTotal(total);
        }
      })
      .catch(() => {});

    // Fetch recent activities (egg-related)
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    activityAPI.getByDateRange(
      weekAgo.toISOString().split('T')[0],
      today.toISOString().split('T')[0],
      'egg_collection'
    ).then(res => {
      const data = res.data?.results !== undefined ? res.data.results : res.data;
      setRecentActivities(data || []);
    }).catch(() => {});
  }, []);



  const handleExportPDF = () => {
    window.print();
  };

  if (loading) return <div className="page-loading">Loading egg production...</div>;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayEggs = (productions || [])
    .filter(p => p.date === todayStr)
    .reduce((sum, p) => sum + (p.quantity || 0), 0);

  return (
    <div className="egg-production">
      <div className="page-header">
        <div className="page-title-row">
          <span className="page-icon">🥚</span>
          <h1>Egg Production</h1>
          <span className="page-subtitle">Review recent egg production and download the report as a PDF.</span>
        </div>
        <button className="btn-export" onClick={handleExportPDF}>
          📄 Download Egg Production PDF
        </button>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards-row">
        <div className="summary-card">
          <div className="sc-icon">🥚</div>
          <div className="sc-label">TODAY'S EGG COUNT</div>
          <div className="sc-value">{todayEggs}</div>
          <div className="sc-sub">Weekly total: {weeklyTotal} eggs</div>
        </div>
        <div className="summary-card">
          <div className="sc-icon">📋</div>
          <div className="sc-label">RECENT ACTIVITY</div>
          <div className="sc-value">{recentActivities.length}</div>
          <div className="sc-sub">Last 7 days of operations</div>
        </div>
      </div>

      {/* Recent Activity History Table */}
      <div className="content-card">
        <h2>Recent Activity History</h2>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>DATE</th>
                <th>TIME</th>
                <th>ACTIVITY</th>
                <th>ANIMAL</th>
                <th>RECORDED BY</th>
                <th>NOTES</th>
              </tr>
            </thead>
            <tbody>
              {recentActivities.length > 0 ? recentActivities.map(a => (
                <tr key={a.id}>
                  <td>{new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</td>
                  <td>{a.time}</td>
                  <td>{a.activity_type_display}</td>
                  <td>{a.animal_name || '—'}</td>
                  <td>{a.employee_name || '—'}</td>
                  <td>{a.notes || '—'}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="empty-cell">No recent egg collection activities.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EggProduction;
