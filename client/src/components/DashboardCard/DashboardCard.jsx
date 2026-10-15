import React from 'react';
import './DashboardCard.css';

const DashboardCard = ({ title, value, subtitle, icon: Icon, trend, trendValue }) => {
  const hasTrend = trend !== null && trend !== undefined && Number.isFinite(Number(trend));
  const positive = hasTrend && Number(trend) >= 0;

  return (
    <div className="dashboard-card">
      <div className="dashboard-card-top">
        <div>
          <p className="dashboard-label">{title}</p>
          <h3>{value}</h3>
          <p className="dashboard-subtitle">{subtitle}</p>
        </div>
        {Icon && (
          <div className="dashboard-icon-wrap">
            <Icon />
          </div>
        )}
      </div>

      {hasTrend && (
        <div className="dashboard-card-bottom">
          <span className={`trend-pill ${positive ? 'positive' : 'negative'}`}>
            {positive ? '+' : '-'}{Math.abs(trend)}%
          </span>
        </div>
      )}
    </div>
  );
};

export default DashboardCard;
