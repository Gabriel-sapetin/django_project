/**
 * Animals Component - Matches Haidee's animals page with detail view
 */

import React, { useState, useEffect } from 'react';
import { useFetch } from '../hooks';
import { mortalityAPI, activityAPI } from '../services/apiService';
import './Animals.css';

export const Animals = () => {
  const { data: animals, loading, error } = useFetch('/animals/');
  const [selectedAnimal, setSelectedAnimal] = useState(null);

  if (loading) return <div className="page-loading">Loading animals...</div>;
  if (error) return <div className="page-error">Error: {error.message}</div>;

  if (selectedAnimal) {
    return <AnimalDetail animal={selectedAnimal} onBack={() => setSelectedAnimal(null)} />;
  }

  // Group by category
  const grouped = (animals || []).reduce((acc, animal) => {
    const cat = animal.category_display || animal.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(animal);
    return acc;
  }, {});

  return (
    <div className="animals">
      <div className="page-header">
        <div className="page-title-row">
          <span className="page-icon">🐾</span>
          <h1>Animals</h1>
          <span className="page-subtitle">Review animal records and monitoring data.</span>
        </div>
      </div>

      <div className="content-card">
        <h2>Animal Records</h2>

        {Object.entries(grouped).map(([category, categoryAnimals]) => (
          <div key={category} className="animal-category-section">
            <h3 className="category-title">{category}</h3>
            <div className="animals-grid">
              {categoryAnimals.map(animal => (
                <div
                  key={animal.id}
                  className="animal-card"
                  onClick={() => setSelectedAnimal(animal)}
                >
                  <div className="acard-header">
                    <span className="acard-name">{animal.name}</span>
                    <span className="acard-badge">{animal.category_display}</span>
                  </div>
                  <div className="acard-body">
                    <div className="acard-stat">
                      <strong>Total Count:</strong> {animal.total_count}
                    </div>
                    <div className="acard-stat">
                      <strong>Recent Mortality:</strong> <span className="text-muted">No mortality recorded</span>
                    </div>
                    <div className="acard-stat">
                      <strong>Activity:</strong>
                      <br />
                      <span className="text-muted italic">No records found</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {(!animals || animals.length === 0) && (
          <p className="empty-msg">No animals found.</p>
        )}
      </div>
    </div>
  );
};

/**
 * Animal Detail View - Matches Haidee's animal detail page
 */
const AnimalDetail = ({ animal, onBack }) => {
  const [mortality, setMortality] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch mortality for this animal
        const mortRes = await mortalityAPI.getAll();
        const mortData = mortRes.data?.results !== undefined ? mortRes.data.results : mortRes.data;
        const animalMortality = (mortData || []).filter(m =>
          m.animal === animal.id || m.animal_name === animal.name
        );
        setMortality(animalMortality);

        // Fetch activities for this animal
        const actRes = await activityAPI.getAll();
        const actData = actRes.data?.results !== undefined ? actRes.data.results : actRes.data;
        const animalActivities = (actData || []).filter(a =>
          a.animal === animal.id || a.animal_name === animal.name
        );
        setActivities(animalActivities);
      } catch (err) {
        console.error('Failed to fetch animal details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [animal]);

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="animal-detail">
      <div className="detail-card">
        <h1 className="detail-title">Animal: {animal.name}</h1>

        <button className="btn-export" onClick={handleExportPDF}>
          📄 Export to PDF
        </button>

        <div className="detail-info-box">
          <p><strong>Animal Type:</strong> {animal.category_display || animal.category}</p>
          <p><strong>Total Count:</strong> {animal.total_count}</p>
        </div>

        <h2 className="detail-section-title">Recent Mortality</h2>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Count</th>
                <th>Reason</th>
                <th>Reported By</th>
              </tr>
            </thead>
            <tbody>
              {mortality.length > 0 ? mortality.map(m => (
                <tr key={m.id}>
                  <td>{m.date}</td>
                  <td>{m.count}</td>
                  <td>{m.reason || '—'}</td>
                  <td>{m.reported_by_username || '—'}</td>
                </tr>
              )) : (
                <tr><td colSpan="4" className="empty-cell">No mortality records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <h2 className="detail-section-title">Activity History</h2>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Activity Type</th>
                <th>Details</th>
                <th>Recorded By</th>
              </tr>
            </thead>
            <tbody>
              {activities.length > 0 ? activities.map(a => (
                <tr key={a.id}>
                  <td>{a.date}</td>
                  <td>{a.time}</td>
                  <td>{a.activity_type_display}</td>
                  <td>{a.notes || '—'}</td>
                  <td>{a.employee_name || '—'}</td>
                </tr>
              )) : (
                <tr><td colSpan="5" className="empty-cell">No activity records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <a href="#" className="back-link" onClick={(e) => { e.preventDefault(); onBack(); }}>
          Back to Animals
        </a>
      </div>
    </div>
  );
};

export default Animals;
