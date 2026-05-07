/**
 * Feed Stock Component - Matches Haidee's feed_inventory page design
 */

import React from 'react';
import { useFetch } from '../hooks';
import './FeedStock.css';

export const FeedStock = () => {
  const { data: feeds, loading, error } = useFetch('/feeds/');
  const { data: summary } = useFetch('/feeds/stock_summary/');

  const handleExportPDF = () => {
    window.print();
  };

  if (loading) return <div className="page-loading">Loading feed stock...</div>;
  if (error) return <div className="page-error">Error: {error.message}</div>;

  const totalStock = summary?.total_stock ?? feeds?.reduce((sum, f) => sum + parseFloat(f.current_stock || 0), 0) ?? 0;

  return (
    <div className="feed-stock">
      <div className="page-header">
        <div className="page-title-row">
          <span className="page-icon">🌾</span>
          <h1>Feed Stock</h1>
          <span className="page-subtitle">View feed stock data.</span>
        </div>
        <button className="btn-export" onClick={handleExportPDF}>
          📄 Export to PDF
        </button>
      </div>

      <div className="summary-cards-row">
        <div className="summary-card">
          <div className="sc-icon">🌾</div>
          <div className="sc-value">{summary?.total_feed_types ?? feeds?.length ?? 0}</div>
          <div className="sc-label">FEED TYPES</div>
        </div>
        <div className="summary-card">
          <div className="sc-icon">📦</div>
          <div className="sc-value">{parseFloat(totalStock).toFixed(1)}</div>
          <div className="sc-label">TOTAL STOCK (KG)</div>
        </div>
      </div>

      <div className="content-card">
        <h2>Feed Stock</h2>
        <div className="feed-list">
          {feeds && feeds.length > 0 ? feeds.map(feed => {
            const stock = parseFloat(feed.current_stock);
            const threshold = parseFloat(feed.low_stock_threshold);
            const isLow = stock <= threshold;
            return (
              <div key={feed.id} className="feed-item">
                <div className="feed-item-header">
                  <h3>{feed.name}</h3>
                  <span className={`stock-badge ${isLow ? 'low' : 'normal'}`}>
                    {stock.toFixed(2)}
                  </span>
                </div>
                <div className="feed-item-details">
                  <span><strong>Low Stock Threshold:</strong> {threshold.toFixed(2)}</span>
                  <span><strong>Last Updated:</strong> {new Date(feed.updated_at).toLocaleString('en-US', {
                    month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}</span>
                </div>
              </div>
            );
          }) : (
            <p className="empty-msg">No feed stock records found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedStock;
