/**
 * Dashboard Component - Matches Haidee's dashboard layout
 */

import React, { useEffect, useState } from 'react';
import { dashboardAPI, activityAPI } from '../services/apiService';
import './Dashboard.css';

export const Dashboard = () => {
  const [data, setData] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activityFilter, setActivityFilter] = useState('today');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [activityFilter]);

  const fetchDashboard = async () => {
    try {
      const res = await dashboardAPI.getSummary();
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const today = new Date();
      let startDate;
      if (activityFilter === 'today') {
        startDate = today.toISOString().split('T')[0];
      } else if (activityFilter === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        startDate = weekAgo.toISOString().split('T')[0];
      } else {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        startDate = monthAgo.toISOString().split('T')[0];
      }
      const endDate = today.toISOString().split('T')[0];
      const res = await activityAPI.getByDateRange(startDate, endDate);
      const result = res.data?.results !== undefined ? res.data.results : res.data;
      setActivities(result || []);
    } catch (err) {
      // Try today endpoint as fallback
      try {
        const res = await activityAPI.getToday();
        const result = res.data?.results !== undefined ? res.data.results : res.data;
        setActivities(result || []);
      } catch {
        setActivities([]);
      }
    }
  };

  if (loading) return <div className="page-loading">Loading dashboard...</div>;

  const filteredActivities = activities.filter(a => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (a.activity_type_display || '').toLowerCase().includes(term) ||
      (a.employee_name || '').toLowerCase().includes(term) ||
      (a.animal_name || '').toLowerCase().includes(term) ||
      (a.notes || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="dashboard">
      <div className="page-header">
        <div className="page-title-row">
          <span className="page-icon">📊</span>
          <h1>Dashboard</h1>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="dashboard-cards">
        <div className="dash-card">
          <div className="dc-icon">🐔</div>
          <div className="dc-label">CHICKEN DASHBOARD OVERVIEW</div>
          <div className="dc-main">Flock monitoring</div>
          <div className="dc-sub">Chicken, Pigs, Quail</div>
        </div>
        <div className="dash-card">
          <div className="dc-icon">🥚</div>
          <div className="dc-label">TODAY'S EGG COUNT</div>
          <div className="dc-value">{data?.total_eggs_today || 0}</div>
          <div className="dc-sub">Weekly total: {data?.total_eggs_week || 0} eggs</div>
        </div>
        <div className="dash-card">
          <div className="dc-icon">🌾</div>
          <div className="dc-label">FEED STOCK</div>
          <div className="dc-value">{data?.total_feed_stock?.toFixed(1) || '0.0'} kg</div>
          <div className="dc-sub">
            {data?.feed_status === 'critical' ? '⚠️ Critical levels' :
             data?.feed_status === 'warning' ? '⚠️ Low stock' :
             '✓ Stock levels stable'}
          </div>
        </div>
        <div className="dash-card">
          <div className="dc-icon">📋</div>
          <div className="dc-label">RECENT MORTALITY</div>
          <div className="dc-value">{data?.recent_mortality || 0}</div>
          <div className="dc-sub">Last 7 days</div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="content-card">
        <div className="activity-header">
          <h2>Recent Activity</h2>
          <div className="activity-controls">
            <input
              type="text"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="activity-search"
            />
            <div className="activity-filters">
              <button
                className={`filter-btn ${activityFilter === 'today' ? 'active' : ''}`}
                onClick={() => setActivityFilter('today')}
              >
                Today
              </button>
              <button
                className={`filter-btn ${activityFilter === 'week' ? 'active' : ''}`}
                onClick={() => setActivityFilter('week')}
              >
                This Week
              </button>
              <button
                className={`filter-btn ${activityFilter === 'month' ? 'active' : ''}`}
                onClick={() => setActivityFilter('month')}
              >
                This Month
              </button>
            </div>
          </div>
        </div>

        {filteredActivities.length > 0 ? (
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
                {filteredActivities.slice(0, 20).map(activity => (
                  <tr key={activity.id}>
                    <td>{activity.date}</td>
                    <td>{activity.time}</td>
                    <td>{activity.activity_type_display}</td>
                    <td>{activity.animal_name || '—'}</td>
                    <td>{activity.employee_name || '—'}</td>
                    <td>{activity.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="empty-msg">No activities found for this period.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
