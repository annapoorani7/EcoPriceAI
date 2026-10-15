import React from 'react';
import {
  ResponsiveContainer,
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';
import './Charts.css';

const getKey = (item) => {
  if (!item) return 'value';
  if ('revenue' in item) return 'revenue';
  if ('value' in item) return 'value';
  if ('occupancy' in item) return 'occupancy';
  if ('price' in item) return 'price';
  return Object.keys(item)[1] || Object.keys(item)[0] || 'value';
};

const Charts = ({ title, chartType = 'bar', data = [] }) => {
  const safeData = data.length ? data : [{ name: 'Jan', value: 0 }];
  const seriesKey = getKey(safeData[0]);
  const xKey = getKeyForLabel(safeData[0]);

  const sharedProps = {
    data: safeData,
    margin: { top: 12, right: 16, left: 0, bottom: 10 },
  };

  const renderChart = () => {
    if (chartType === 'area') {
      return (
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart {...sharedProps}>
            <defs>
              <linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#2c7b4f" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#2c7b4f" stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#dfe8e1" vertical={false} />
            <XAxis dataKey={xKey} tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip />
            <Area type="monotone" dataKey={seriesKey} stroke="#2c7b4f" fill="url(#revenueFill)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart {...sharedProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#dfe8e1" vertical={false} />
            <XAxis dataKey={xKey} tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey={seriesKey} stroke="#1f5d42" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={250}>
        <BarChart {...sharedProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="#dfe8e1" vertical={false} />
          <XAxis dataKey={xKey} tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey={seriesKey} radius={[8, 8, 0, 0]} fill="#4fa96d" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="chart-panel section-card">
      <div className="chart-header">
        <h3>{title}</h3>
        <span className="chart-chip">Live</span>
      </div>
      {renderChart()}
    </div>
  );
};

function getKeyForLabel(item) {
  if (!item) return 'name';
  if ('month' in item) return 'month';
  if ('name' in item) return 'name';
  if ('label' in item) return 'label';
  if ('day' in item) return 'day';
  return Object.keys(item)[0] || 'name';
}

export default Charts;
