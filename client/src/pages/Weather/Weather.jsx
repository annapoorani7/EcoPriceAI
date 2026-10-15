import React, { useState } from 'react';
import {
  FaCloud,
  FaCloudRain,
  FaCloudSun,
  FaSun,
} from 'react-icons/fa';
import ForecastCard from '../../components/ForecastCard/ForecastCard';
import './Weather.css';

const weatherIcons = {
  sunny: FaSun,
  partlyCloudy: FaCloudSun,
  rainy: FaCloudRain,
  cloudy: FaCloud,
};

const sampleWeather = {
  location: 'Munnar, Kerala',
  current: {
    temp: '22°C',
    humidity: '68%',
    rainChance: 35,
    wind: '12'
  },
  forecast: [
    { day: 'Tue', icon: weatherIcons.partlyCloudy, temp: '23°C', rain: 20, wind: 10 },
    { day: 'Wed', icon: weatherIcons.rainy, temp: '21°C', rain: 55, wind: 14 },
    { day: 'Thu', icon: weatherIcons.cloudy, temp: '24°C', rain: 30, wind: 9 },
    { day: 'Fri', icon: weatherIcons.sunny, temp: '26°C', rain: 12, wind: 8 },
  ]
};

const StatCard = ({ label, value }) => (
  <div className="bg-white rounded-2xl shadow p-4 text-center">
    <p className="text-sm text-gray-500">{label}</p>
    <div className="mt-2 text-2xl font-semibold text-gray-800">{value}</div>
  </div>
);

const Weather = () => {
  const [data, setData] = useState(sampleWeather);
  const [loading, setLoading] = useState(false);

  const fetchPlaceholder = () => {
    setLoading(true);
    setTimeout(() => {
      setData(sampleWeather);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="weather-page p-6 min-h-[calc(100vh-70px)]">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Weather Dashboard</h2>
          <div className="flex items-center gap-2">
            <button onClick={fetchPlaceholder} className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md">Refresh</button>
            <span className="text-sm text-gray-500">API: Weather API placeholder</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Temperature" value={loading ? '...' : data.current.temp} />
          <StatCard label="Humidity" value={loading ? '...' : data.current.humidity} />
          <StatCard label="Rain Chance" value={loading ? '...' : `${data.current.rainChance}%`} />
          <StatCard label="Wind Speed" value={loading ? '...' : `${data.current.wind} km/h`} />
        </div>

        <h3 className="text-lg font-medium mb-3">Forecast</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {data.forecast.map((f, i) => (
            <ForecastCard key={i} day={f.day} icon={f.icon} temp={f.temp} rainChance={f.rain} wind={f.wind} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Weather;
