/**
 * Mortality Summary Component - Matches Haidee's mortality summary page
 */

import React, { useState, useEffect } from 'react';
import { useFetch } from '../hooks';
import { mortalityAPI } from '../services/apiService';
import './MortalitySummary.css';

export const MortalitySummary = () => {
  const { data: allRecords, loading, error } = useFetch('/mortality/');
  const [weeklySummary, setWeeklySummary] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredRecords, setFilteredRecords] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await mortalityAPI.getWeeklySummary();
        setWeeklySummary(res.data);
      } catch (err) {
        console.error('Failed to fetch mortality summary:', err);
      }
    };
    fetchSummary();

    // Set default date range (last 30 days)
    const today = new Date();
    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(monthAgo.toISOString().split('T')[0]);
  }, []);

  const handleFilter = async () => {
    if (!startDate || !endDate) return;
    try {
      const res = await mortalityAPI.getByDateRange(startDate, endDate);
      const data = res.data?.results !== undefined ? res.data.results : res.data;
      setFilteredRecords(data);
    } catch (err) {
      console.error('Failed to filter mortality records:', err);
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  if (loading) return <div className="page-loading">Loading mortality data...</div>;
  if (error) return <div className="page-error">Error: {error.message}</div>;

  const records = filteredRecords || allRecords || [];
  const totalDeaths = weeklySummary?.total_mortality ?? records.reduce((sum, r) => sum + (r.count || 0), 0);

  return (
    <div className="mortality-summary">
      <div className="page-header">
        <div className="page-title-row">
          <span className="page-icon">⚠️</span>
          <h1>Mortality Summary</h1>
          <span className="page-subtitle">Recent Mortality Data.</span>
        </div>
        <button className="btn-export" onClick={handleExportPDF}>
          📄 Export to PDF
        </button>
      </div>

      <div className="summary-cards-row">
        <div className="summary-card">
          <div className="sc-icon">📊</div>
          <div className="sc-value">{totalDeaths}</div>
          <div className="sc-label">TOTAL DEATHS ({startDate ? new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase() : 'N/A'} – {endDate ? new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase() : 'N/A'})</div>
        </div>
        <div className="summary-card">
          <div className="sc-icon">📈</div>
          <div className="sc-value">{records.length}</div>
          <div className="sc-label">RECORDS</div>
        </div>
      </div>

      <div className="content-card">
        <h2>Mortality Records</h2>

        <div className="filter-row">
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="date-input"
          />
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="date-input"
          />
          <button className="btn-filter" onClick={handleFilter}>Filter</button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>DATE</th>
                <th>ANIMAL</th>
                <th>COUNT</th>
                <th>REASON</th>
                <th>REPORTED BY</th>
              </tr>
            </thead>
            <tbody>
              {records.length > 0 ? records.map(record => (
                <tr key={record.id}>
                  <td>{record.date}</td>
                  <td>{record.animal_name}</td>
                  <td>{record.count}</td>
                  <td>{record.reason || '—'}</td>
                  <td>{record.reported_by_username || '—'}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="empty-cell">No mortality records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MortalitySummary;
