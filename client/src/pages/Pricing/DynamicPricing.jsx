import React, { useEffect, useMemo, useState } from 'react';
import { hotelService, pricingService } from '../../services/apiService';
import './DynamicPricing.css';

const Card = ({ title, value }) => value !== null && (
  <div className="pricing-result-card section-card">
    <p>{title}</p>
    <strong>{value}</strong>
  </div>
);

const formatResultNumber = (value, prefix = '') => {
  const number = Number(value);
  return Number.isFinite(number) ? `${prefix}${number.toLocaleString('en-IN')}` : null;
};

const DynamicPricing = () => {
  const [hotels, setHotels] = useState([]);
  const [hotelId, setHotelId] = useState('');
  const [roomType, setRoomType] = useState('');
  const [checkInDate, setCheckInDate] = useState(new Date().toISOString().split('T')[0]);
  const [result, setResult] = useState(null);
  const [loadingHotels, setLoadingHotels] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadHotels = async () => {
      setLoadingHotels(true);
      setError('');
      try {
        const response = await hotelService.getHotels();
        const availableHotels = Array.isArray(response.hotels) ? response.hotels : [];
        setHotels(availableHotels);
        setHotelId((currentHotelId) => currentHotelId || availableHotels[0]?._id || '');
        setRoomType((currentRoomType) => currentRoomType || availableHotels[0]?.rooms?.[0]?.roomType || '');
      } catch (err) {
        setError(err.message || 'Unable to load hotels for pricing.');
      } finally {
        setLoadingHotels(false);
      }
    };

    loadHotels();
  }, []);

  const hotel = useMemo(() => hotels.find((item) => item._id === hotelId) || null, [hotels, hotelId]);
  const rooms = Array.isArray(hotel?.rooms) ? hotel.rooms : [];

  const handleHotelChange = (event) => {
    const selectedHotelId = event.target.value;
    const selectedHotel = hotels.find((item) => item._id === selectedHotelId);
    setHotelId(selectedHotelId);
    setRoomType(selectedHotel?.rooms?.[0]?.roomType || '');
    setResult(null);
  };

  const handlePredict = async () => {
    if (!hotelId || !roomType || !checkInDate) {
      setError('Select a hotel, room type, and check-in date.');
      return;
    }

    setPredicting(true);
    setError('');
    setResult(null);
    try {
      const response = await pricingService.predictPrice({ hotelId, roomType, checkInDate });
      setResult(response.pricing || null);
      if (!response.pricing) setError('Pricing response did not include a recommendation.');
    } catch (err) {
      setError(err.message || 'Unable to calculate a pricing recommendation.');
    } finally {
      setPredicting(false);
    }
  };

  return (
    <div className="page-shell dynamic-pricing-page">
      <div className="page-header-block">
        <div><p className="soft-badge">Pricing workflow</p><h1>Choose the right room price for your next stay.</h1>
        <p className="pricing-intro">Use your current room price and available demand information to receive a suggested price.</p>
        </div>
      </div>
        <div className="pricing-layout">
          <div className="pricing-form section-card">
            <h2>Build your recommendation</h2>
            <div className="pricing-fields">
              <p className="pricing-step"><span>01</span> Choose your hotel</p>
              <label htmlFor="pricing-hotel">Hotel</label>
              <select id="pricing-hotel" value={hotelId} onChange={handleHotelChange} disabled={loadingHotels || hotels.length === 0}>
                <option value="">{loadingHotels ? 'Loading hotels...' : hotels.length ? 'Select a hotel' : 'No hotels available'}</option>
                {hotels.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
              </select>

              <p className="pricing-step"><span>02</span> Choose a room type</p>
              <label htmlFor="pricing-room">Room type</label>
              <select id="pricing-room" value={roomType} onChange={(event) => { setRoomType(event.target.value); setResult(null); }} disabled={!hotel || rooms.length === 0}>
                <option value="">{rooms.length ? 'Select a room type' : 'No rooms available'}</option>
                {rooms.map((room) => <option key={room._id || room.roomType} value={room.roomType}>{room.roomType}</option>)}
              </select>

              <p className="pricing-step"><span>03</span> Select the check-in date</p>
              <label htmlFor="pricing-date">Check-in date</label>
              <input id="pricing-date" type="date" value={checkInDate} onChange={(event) => { setCheckInDate(event.target.value); setResult(null); }} />

              {error && <div className="pricing-feedback pricing-error">{error}</div>}
              {!loadingHotels && hotels.length === 0 && <div className="pricing-feedback">Add a hotel and at least one room before requesting a suggested price.</div>}

              <p className="pricing-step"><span>04</span> Get the suggested price</p>
              <button onClick={handlePredict} disabled={predicting || loadingHotels || !hotelId || !roomType || !checkInDate} className="primary-btn pricing-submit">{predicting ? 'Getting suggestion...' : 'Get Suggested Price'}</button>
            </div>
          </div>

          <div className="pricing-results">
            <h2>Your suggested price</h2>
            {!result && <div className="pricing-placeholder section-card">Choose a hotel, room, and date to see the suggested price.</div>}
            {result && <div className="pricing-result-grid">
              <Card title="Current Room Price" value={formatResultNumber(result.basePrice, '₹')} />
              <Card title="Suggested Room Price" value={formatResultNumber(result.recommendedPrice, '₹')} />
              <Card title="Price Difference" value={formatResultNumber(result.priceChange, '₹')} />
              <Card title="Percentage Change" value={formatResultNumber(result.priceChangePercentage) ? `${formatResultNumber(result.priceChangePercentage)}%` : null} />
            </div>}
          </div>
          {result && <p className="pricing-note">This is a data-based recommendation. The final price decision remains with the hotel owner.</p>}
        </div>
      </div>
  );
};

export default DynamicPricing;
