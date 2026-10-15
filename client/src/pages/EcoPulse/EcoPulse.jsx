import React, { useEffect, useMemo, useState } from 'react';
import Charts from '../../components/Charts/Charts';
import { ecopulseService } from '../../services/apiService';
import { calculatePriceScenario, formatLocalDateInput } from '../../utils/ecopulseMetrics';
import './EcoPulse.css';

const formatCurrency = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : 'Not available';
};

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleDateString();
};

const dateAfter = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return formatLocalDateInput(date);
};

const EcoPulse = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hotelId, setHotelId] = useState('');
  const [roomType, setRoomType] = useState('');
  const [checkInDate, setCheckInDate] = useState(() => dateAfter(1));
  const [checkOutDate, setCheckOutDate] = useState(() => dateAfter(2));
  const [roomCount, setRoomCount] = useState('1');
  const [proposedPrice, setProposedPrice] = useState('');
  const [scenario, setScenario] = useState(null);
  const [scenarioError, setScenarioError] = useState('');

  useEffect(() => {
    let active = true;
    ecopulseService.getOverview()
      .then((response) => {
        if (!active) return;
        setOverview(response);
        const firstHotel = response.hotels?.[0];
        setHotelId(firstHotel?._id || '');
        setRoomType(firstHotel?.rooms?.[0]?.roomType || '');
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Unable to load EcoPulse insights.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  const selectedHotel = useMemo(
    () => overview?.hotels?.find((hotel) => String(hotel._id) === String(hotelId)) || null,
    [hotelId, overview],
  );
  const selectedRoom = useMemo(
    () => selectedHotel?.rooms?.find((room) => room.roomType === roomType) || null,
    [roomType, selectedHotel],
  );
  const bookingPace = overview?.metrics?.bookingPace;
  const upcoming = overview?.metrics?.upcoming30d;
  const monthToDate = overview?.metrics?.monthToDate;

  useEffect(() => {
    setScenario(null);
    setScenarioError('');
    setProposedPrice(selectedRoom?.basePrice === undefined ? '' : Number(selectedRoom.basePrice).toFixed(2));
  }, [selectedRoom]);

  const paceChart = bookingPace ? [
    { window: 'Previous 7 days', bookings: bookingPace.previous7d },
    { window: 'Last 7 days', bookings: bookingPace.current7d },
  ] : [];

  const handleSimulate = (event) => {
    event.preventDefault();
    setScenarioError('');
    setScenario(null);
    if (!selectedRoom) {
      setScenarioError('Select a room type with a listed price first.');
      return;
    }

    try {
      setScenario(calculatePriceScenario({
        currentPrice: selectedRoom.basePrice,
        proposedPrice,
        checkInDate,
        checkOutDate,
        roomCount,
        availableRooms: selectedRoom.availableRooms,
      }));
    } catch (validationError) {
      setScenarioError(validationError.message);
    }
  };

  if (loading) {
    return <main className="page-shell ecopulse-page"><div className="ecopulse-state" role="status">Loading EcoPulse data...</div></main>;
  }

  if (error) {
    return <main className="page-shell ecopulse-page"><div className="ecopulse-state ecopulse-error" role="alert">{error}</div></main>;
  }

  if (!overview) return null;

  return (
    <main className="page-shell ecopulse-page">
      <header className="ecopulse-header">
        <div>
          <p className="soft-badge">Owner intelligence</p>
          <h1>EcoPulse AI</h1>
          <p>Booking activity and transparent pricing scenarios from your recorded hotel data.</p>
        </div>
        <p className="ecopulse-freshness">Updated {new Date(overview.generatedAt).toLocaleString()}</p>
      </header>

      {overview.hotelCount === 0 ? (
        <>
          <section className="ecopulse-empty section-card" role="status">
            <h2>No hotel data yet</h2>
            <p>Add a hotel and rooms, then record bookings to unlock owner-scoped booking activity. No sample metrics are shown here.</p>
          </section>
          <section className="ecopulse-section" aria-labelledby="ecopulse-empty-insights-heading">
            <div className="ecopulse-section-heading"><div><h2 id="ecopulse-empty-insights-heading">Signals to review</h2><p>Signals stay available in an insufficient-data state until real records exist.</p></div></div>
            <div className="ecopulse-insight-grid">
              {overview.insights.map((insight) => (
                <article className="ecopulse-insight section-card" key={insight.id}>
                  <span className="ecopulse-state-tag insufficient-data">Insufficient data</span>
                  <h3>{insight.title}</h3>
                  <p className="ecopulse-evidence"><strong>Evidence</strong>{insight.evidence}</p>
                  <p><strong>Suggested action</strong>{insight.action}</p>
                  <small>{insight.method}</small>
                </article>
              ))}
            </div>
          </section>
        </>
      ) : (
        <>
          <section className="ecopulse-section" aria-labelledby="pulse-overview-heading">
            <div className="ecopulse-section-heading">
              <div><h2 id="pulse-overview-heading">Observed activity</h2><p>Counts come from your booking records; these are not demand forecasts.</p></div>
            </div>
            <div className="ecopulse-metric-grid">
              <article className="ecopulse-metric section-card">
                <span>Bookings created · last 7 days</span>
                <strong>{bookingPace.current7d}</strong>
                <small>Previous 7 days: {bookingPace.previous7d}</small>
              </article>
              <article className="ecopulse-metric section-card">
                <span>Upcoming arrivals · next 30 days</span>
                <strong>{upcoming.arrivals}</strong>
                <small>{upcoming.roomsBooked} room(s) recorded</small>
              </article>
              <article className="ecopulse-metric section-card">
                <span>Confirmed/completed booked value · check-in this month</span>
                <strong>{formatCurrency(monthToDate.confirmedBookingValue)}</strong>
                <small>{monthToDate.confirmedBookingCount} booking(s), excluding refunded payments. Booked value, not cash revenue.</small>
              </article>
              <article className="ecopulse-metric section-card">
                <span>Paid amount recorded on bookings · check-in this month</span>
                <strong>{formatCurrency(monthToDate.paidBookingValue)}</strong>
                <small>{monthToDate.paidBookingCount} paid booking(s) at query time, grouped by check-in date, not payment date.</small>
              </article>
            </div>
            {bookingPace.current7d + bookingPace.previous7d === 0 && (
              <p className="ecopulse-inline-note">Insufficient booking history to compare the two seven-day windows.</p>
            )}
            {monthToDate.confirmedBookingCount === 0 && (
              <p className="ecopulse-inline-note">No confirmed or completed bookings have check-in dates in the current month.</p>
            )}
          </section>

          <section className="ecopulse-two-column">
            <div className="ecopulse-panel">
              <div className="ecopulse-section-heading"><div><h2>Booking pace</h2><p>Creation dates, not stay dates.</p></div></div>
              {bookingPace.current7d + bookingPace.previous7d > 0
                ? <Charts title="Bookings created by 7-day window" chartType="bar" data={paceChart} />
                : <div className="ecopulse-empty section-card">Not enough booking records to draw a comparison.</div>}
            </div>

            <div className="ecopulse-panel">
              <div className="ecopulse-section-heading"><div><h2>Upcoming booking activity</h2><p>Next 30 days, up to 8 records. Guest contact details are not included.</p></div></div>
              {overview.upcomingBookings.length > 0 ? (
                <div className="ecopulse-booking-list section-card">
                  {overview.upcomingBookings.map((booking) => (
                    <article className="ecopulse-booking-row" key={booking._id}>
                      <div>
                        <strong>{booking.hotelName} · {booking.roomType}</strong>
                        <span>{formatDate(booking.checkInDate)} to {formatDate(booking.checkOutDate)} · {booking.numberOfRooms} room(s)</span>
                      </div>
                      <div className="ecopulse-booking-value">
                        <strong>Booking total {formatCurrency(booking.totalAmount)}</strong>
                        <span>{booking.bookingStatus} · {booking.paymentStatus}</span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="ecopulse-empty section-card">No active arrivals are recorded in the next 30 days.</div>
              )}
            </div>
          </section>

          <section className="ecopulse-section" aria-labelledby="ecopulse-insights-heading">
            <div className="ecopulse-section-heading"><div><h2 id="ecopulse-insights-heading">Signals to review</h2><p>Rules-based summaries of recorded activity, not predictions.</p></div></div>
            <div className="ecopulse-insight-grid">
              {overview.insights.map((insight) => (
                <article className="ecopulse-insight section-card" key={insight.id}>
                  <span className={`ecopulse-state-tag ${insight.state}`}>{insight.state === 'observed' ? 'Observed' : 'Insufficient data'}</span>
                  <h3>{insight.title}</h3>
                  <p className="ecopulse-evidence"><strong>Evidence</strong>{insight.evidence}</p>
                  <p><strong>Suggested action</strong>{insight.action}</p>
                  <small>{insight.method}</small>
                </article>
              ))}
            </div>
          </section>
        </>
      )}

      <section className="ecopulse-section" aria-labelledby="scenario-heading">
        <div className="ecopulse-section-heading"><div><h2 id="scenario-heading">Price scenario simulator</h2><p>Arithmetic comparison only. This does not change your listed room price or predict demand.</p></div></div>
        {overview.hotelCount === 0 ? (
          <div className="ecopulse-empty section-card">Add a hotel and a room with a listed price to run a scenario.</div>
        ) : (
          <div className="ecopulse-simulator section-card">
            <form className="ecopulse-simulator-form" onSubmit={handleSimulate}>
              <div className="field-wrap">
                <label htmlFor="ecopulse-hotel">Hotel</label>
                <select id="ecopulse-hotel" value={hotelId} onChange={(event) => {
                  const nextHotel = overview.hotels.find((hotel) => String(hotel._id) === event.target.value);
                  setHotelId(event.target.value);
                  setRoomType(nextHotel?.rooms?.[0]?.roomType || '');
                }}>
                  {overview.hotels.map((hotel) => <option key={hotel._id} value={hotel._id}>{hotel.name}</option>)}
                </select>
              </div>
              <div className="field-wrap">
                <label htmlFor="ecopulse-room">Room type</label>
                <select id="ecopulse-room" value={roomType} onChange={(event) => setRoomType(event.target.value)} disabled={!selectedHotel?.rooms?.length}>
                  {(selectedHotel?.rooms || []).map((room) => <option key={room._id || room.roomType} value={room.roomType}>{room.roomType}</option>)}
                </select>
              </div>
              <div className="field-wrap">
                <label htmlFor="ecopulse-check-in">Check-in</label>
                <input id="ecopulse-check-in" type="date" value={checkInDate} onChange={(event) => setCheckInDate(event.target.value)} />
              </div>
              <div className="field-wrap">
                <label htmlFor="ecopulse-check-out">Check-out</label>
                <input id="ecopulse-check-out" type="date" value={checkOutDate} onChange={(event) => setCheckOutDate(event.target.value)} />
              </div>
              <div className="field-wrap">
                <label htmlFor="ecopulse-room-count">Rooms (max {selectedRoom?.availableRooms || 0} currently marked available)</label>
                <input id="ecopulse-room-count" type="number" min="1" max={selectedRoom?.availableRooms || 0} step="1" value={roomCount} onChange={(event) => setRoomCount(event.target.value)} />
              </div>
              <div className="field-wrap">
                <label htmlFor="ecopulse-proposed-price">Proposed nightly price (₹)</label>
                <input id="ecopulse-proposed-price" type="number" min="0.01" step="0.01" value={proposedPrice} onChange={(event) => setProposedPrice(event.target.value)} />
              </div>
              <div className="ecopulse-inventory-note">
                <strong>Current listed price:</strong> {selectedRoom ? formatCurrency(selectedRoom.basePrice) : 'No room selected'}
                <span>{selectedRoom ? `${selectedRoom.availableRooms} of ${selectedRoom.totalRooms} rooms currently marked available across all dates. This counter is not date-specific.` : 'Add a room and listed price to simulate.'}</span>
              </div>
              {scenarioError && <div className="ecopulse-form-error" role="alert">{scenarioError}</div>}
              <button type="submit" className="primary-btn" disabled={!selectedRoom}>Calculate scenario</button>
            </form>

            {scenario && selectedRoom && (
              <div className="ecopulse-scenario-result" role="status">
                <h3>Scenario totals · {scenario.nights} night(s) · {scenario.roomCount} room(s)</h3>
                <div><span>Current listed-price total</span><strong>{formatCurrency(scenario.currentTotal)}</strong></div>
                <div><span>Proposed-price total</span><strong>{formatCurrency(scenario.proposedTotal)}</strong></div>
                <div><span>Arithmetic difference</span><strong>{formatCurrency(scenario.difference)}</strong></div>
                <small>Calculated as nightly price × {scenario.roomNights} room-night(s). Assumes every selected room-night is booked; it is not a revenue forecast.</small>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
};

export default EcoPulse;