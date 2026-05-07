/**
 * Report with Proof Activities Component - Matches Haidee's activity log page
 */

import React, { useState } from 'react';
import { useFetch } from '../hooks';
import './ReportActivities.css';

export const ReportActivities = () => {
  const { data: activities, loading, error } = useFetch('/activities/');
  const [filterType, setFilterType] = useState('all');
  const [filterAnimal, setFilterAnimal] = useState('all');

  const handleExportPDF = () => {
    window.print();
  };

  const activityTypes = ['all', 'feeding', 'cleaning', 'egg_collection', 'health_check', 'mortality'];
  const activityTypeLabels = {
    all: 'All',
    feeding: 'Feeding',
    cleaning: 'Cleaning',
    egg_collection: 'Egg Collection',
    health_check: 'Health Check',
    mortality: 'Mortality',
  };

  // Get unique animals from activities
  const uniqueAnimals = activities
    ? [...new Set(activities.filter(a => a.animal_name).map(a => a.animal_name))]
    : [];

  // Apply local filters
  const displayActivities = (activities || []).filter(activity => {
    const matchType = filterType === 'all' || activity.activity_type === filterType;
    const matchAnimal = filterAnimal === 'all' || activity.animal_name === filterAnimal;
    return matchType && matchAnimal;
  });

  if (loading) return <div className="page-loading">Loading activities...</div>;
  if (error) return <div className="page-error">Error: {error.message}</div>;

  return (
    <div className="report-activities">
      <div className="page-header">
        <div className="page-title-row">
          <span className="page-icon">📋</span>
          <h1>Report with Proof Activities</h1>
          <span className="page-subtitle">View all recorded activities with photo proof.</span>
        </div>
        <button className="btn-export" onClick={handleExportPDF}>
          📄 Export to PDF
        </button>
      </div>

      <div className="content-card">
        <div className="filter-bar">
          <div className="filter-group">
            <label>Activity Type:</label>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="filter-select">
              {activityTypes.map(type => (
                <option key={type} value={type}>{activityTypeLabels[type]}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Animal:</label>
            <select value={filterAnimal} onChange={e => setFilterAnimal(e.target.value)} className="filter-select">
              <option value="all">All</option>
              {uniqueAnimals.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="activities-count">{displayActivities.length} activity logs</div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ACTIVITY TYPE</th>
                <th>EMPLOYEE</th>
                <th>ANIMAL</th>
                <th>DATE</th>
                <th>TIME</th>
                <th>PHOTO PROOF</th>
                <th>NOTES</th>
              </tr>
            </thead>
            <tbody>
              {displayActivities.length > 0 ? displayActivities.map(activity => (
                <tr key={activity.id}>
                  <td>
                    <span className="activity-type-link">{activity.activity_type_display}</span>
                  </td>
                  <td>{activity.employee_name || '—'}</td>
                  <td>{activity.animal_name || '—'}</td>
                  <td>{activity.date}</td>
                  <td>{activity.time}</td>
                  <td>
                    {activity.photo ? (
                      <span className="proof-yes">✅</span>
                    ) : (
                      <span className="proof-no">❌</span>
                    )}
                  </td>
                  <td>{activity.notes || '—'}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="empty-cell">No activity records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportActivities;
