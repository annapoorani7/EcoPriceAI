import React from 'react';
import './ForecastCard.css';

const ForecastCard = ({ day, icon, temp, rainChance, wind }) => {
  return (
    <div className="forecast-card bg-white rounded-2xl shadow p-4 flex flex-col items-center text-center">
      <p className="text-sm text-gray-500">{day}</p>
      <div className="text-3xl my-2">{icon}</div>
      <p className="text-lg font-semibold">{temp}</p>
      <p className="text-sm text-gray-600 mt-1">Rain: {rainChance}%</p>
      <p className="text-sm text-gray-600">Wind: {wind} km/h</p>
    </div>
  );
};

export default ForecastCard;
