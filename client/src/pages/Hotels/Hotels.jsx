import React, { useCallback, useEffect, useState } from 'react';
import HotelCard from '../../components/HotelCard/HotelCard';
import { hotelService } from '../../services/apiService';
import './Hotels.css';

const emptyRoom = () => ({
  roomType: 'Standard',
  description: '',
  capacity: '',
  totalRooms: '',
  availableRooms: '',
  basePrice: '',
  amenities: '',
});

const emptyForm = () => ({
  name: '',
  description: '',
  location: '',
  address: '',
  city: '',
  state: '',
  country: '',
  latitude: '',
  longitude: '',
  phone: '',
  email: '',
  website: '',
  hotelType: '',
  starRating: 3,
  image: '',
  ecoFriendly: false,
  rooms: [emptyRoom()],
});

const formatCurrency = (value) => `₹${Number(value).toLocaleString('en-IN')}/night`;

const toCardHotel = (hotel) => {
  const rooms = Array.isArray(hotel.rooms) ? hotel.rooms : [];
  const totalRooms = rooms.reduce((sum, room) => sum + Number(room.totalRooms || 0), 0);
  const availableRooms = rooms.reduce((sum, room) => sum + Number(room.availableRooms || 0), 0);
  const pricedRooms = rooms.filter((room) => Number.isFinite(Number(room.basePrice)));
  const averagePrice = pricedRooms.length
    ? pricedRooms.reduce((sum, room) => sum + Number(room.basePrice), 0) / pricedRooms.length
    : null;

  return {
    ...hotel,
    id: hotel._id,
    location: hotel.location || [hotel.city, hotel.state, hotel.country].filter(Boolean).join(', ') || 'Location not available',
    availableRooms: rooms.length ? availableRooms : null,
    occupancy: totalRooms > 0 ? Math.round(((totalRooms - availableRooms) / totalRooms) * 100) : null,
    price: averagePrice === null ? 'Not available' : formatCurrency(averagePrice),
    image: Array.isArray(hotel.images) ? hotel.images[0] : null,
  };
};

const toFormData = (hotel) => ({
  name: hotel.name || '',
  description: hotel.description || '',
  location: hotel.location || '',
  address: hotel.address || '',
  city: hotel.city || '',
  state: hotel.state || '',
  country: hotel.country || '',
  latitude: hotel.latitude ?? '',
  longitude: hotel.longitude ?? '',
  phone: hotel.phone || '',
  email: hotel.email || '',
  website: hotel.website || '',
  hotelType: hotel.hotelType || '',
  starRating: hotel.starRating ?? 3,
  image: Array.isArray(hotel.images) ? hotel.images.join(', ') : '',
  ecoFriendly: Boolean(hotel.ecoFriendly),
  rooms: Array.isArray(hotel.rooms) && hotel.rooms.length > 0
    ? hotel.rooms.map((room) => ({ ...room, amenities: Array.isArray(room.amenities) ? room.amenities.join(', ') : '' }))
    : [emptyRoom()],
});

const toPayload = (formData) => ({
  name: formData.name.trim(),
  description: formData.description.trim(),
  location: formData.location.trim(),
  address: formData.address.trim(),
  city: formData.city.trim(),
  state: formData.state.trim(),
  country: formData.country.trim(),
  latitude: formData.latitude === '' ? 0 : Number(formData.latitude),
  longitude: formData.longitude === '' ? 0 : Number(formData.longitude),
  phone: formData.phone.trim(),
  email: formData.email.trim(),
  website: formData.website.trim(),
  hotelType: formData.hotelType.trim(),
  starRating: Number(formData.starRating),
  images: formData.image.split(',').map((image) => image.trim()).filter(Boolean),
  ecoFriendly: formData.ecoFriendly,
  rooms: formData.rooms.map((room) => ({
    roomType: room.roomType,
    description: room.description.trim(),
    capacity: Number(room.capacity),
    totalRooms: Number(room.totalRooms),
    availableRooms: Number(room.availableRooms),
    basePrice: Number(room.basePrice),
    amenities: room.amenities.split(',').map((amenity) => amenity.trim()).filter(Boolean),
  })),
});

const Hotels = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState(emptyForm);
  const [editingHotel, setEditingHotel] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadHotels = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await hotelService.getHotels();
      setHotels(Array.isArray(response.hotels) ? response.hotels.map(toCardHotel) : []);
    } catch (err) {
      setError(err.message || 'Unable to load hotels. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHotels();
  }, [loadHotels]);

  const handleEdit = (hotel) => {
    setEditingHotel(hotel);
    setFormData(toFormData(hotel));
    setError('');
    setSuccess('');
    setFormOpen(true);
  };

  const handleDelete = async (hotel) => {
    if (window.confirm(`Delete ${hotel.name}?`)) {
      setDeletingId(hotel.id);
      setError('');
      setSuccess('');
      try {
        await hotelService.deleteHotel(hotel.id);
        setHotels((currentHotels) => currentHotels.filter((item) => item.id !== hotel.id));
        setSuccess('Hotel deleted successfully.');
      } catch (err) {
        setError(err.message || 'Unable to delete hotel. Please try again.');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleAdd = () => {
    setEditingHotel(null);
    setFormData(emptyForm());
    setError('');
    setSuccess('');
    setFormOpen(true);
  };

  const handleFieldChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleRoomChange = (index, event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      rooms: current.rooms.map((room, roomIndex) => roomIndex === index ? { ...room, [name]: value } : room),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const payload = toPayload(formData);
      if (editingHotel) {
        await hotelService.updateHotel(editingHotel.id, payload);
        setSuccess('Hotel updated successfully.');
      } else {
        await hotelService.createHotel(payload);
        setSuccess('Hotel created successfully.');
      }
      setFormOpen(false);
      setEditingHotel(null);
      await loadHotels();
    } catch (err) {
      setError(err.message || 'Unable to save hotel. Please check the form and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const closeForm = () => {
    if (!submitting) {
      setFormOpen(false);
      setEditingHotel(null);
    }
  };

  return (
    <div className="page-shell hotels-page">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="soft-badge">Hotel setup</p>
            <h1>Manage your hotels and rooms.</h1>
            <p className="hotel-intro">Add the rooms you manage so EcoPriceAI can calculate useful pricing suggestions.</p>
          </div>
          <button onClick={handleAdd} className="primary-btn">Add hotel</button>
        </div>

        {success && <div className="hotel-feedback hotel-success">{success}</div>}
        {error && <div className="hotel-feedback hotel-error">{error}</div>}
        {loading && <div className="hotel-state">Loading hotels...</div>}
        {!loading && !error && hotels.length === 0 && (
          <div className="hotel-state hotel-empty-state">
            <strong>You have not added a hotel yet.</strong>
            <span>Add your first hotel and at least one room to start using suggested room prices.</span>
          </div>
        )}
        {!loading && hotels.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} onEdit={handleEdit} onDelete={handleDelete} deleting={deletingId === hotel.id} />
            ))}
          </div>
        )}
      </div>

      {formOpen && (
        <div className="hotel-modal-backdrop" role="presentation">
          <div className="hotel-modal section-card" role="dialog" aria-modal="true" aria-labelledby="hotel-form-title">
            <div className="hotel-modal-header">
              <div>
                <p className="soft-badge">Hotel management</p>
                <h3 id="hotel-form-title">{editingHotel ? 'Edit hotel' : 'Add hotel'}</h3>
              </div>
              <button type="button" className="outline-btn" onClick={closeForm} disabled={submitting}>Close</button>
            </div>

            <form onSubmit={handleSubmit} className="hotel-form">
              <div className="hotel-form-grid">
                <h4 className="hotel-form-section-title hotel-form-wide">Hotel details</h4>
                {[
                  ['name', 'Hotel name', true], ['address', 'Address', true], ['city', 'City', true], ['state', 'State', true], ['country', 'Country', true], ['hotelType', 'Hotel type', true],
                ].map(([name, label, required]) => (
                  <div className="field-wrap" key={name}>
                    <label htmlFor={`hotel-${name}`}>{label}{required ? ' *' : ''}</label>
                    <input id={`hotel-${name}`} name={name} value={formData[name]} onChange={handleFieldChange} required={required} type={['latitude', 'longitude', 'starRating'].includes(name) ? 'number' : name === 'email' ? 'email' : 'text'} min={name === 'starRating' ? 1 : undefined} max={name === 'starRating' ? 5 : undefined} step={['latitude', 'longitude'].includes(name) ? 'any' : undefined} />
                  </div>
                ))}
                <h4 className="hotel-form-section-title hotel-form-wide">Contact details</h4>
                {[
                  ['phone', 'Phone', true], ['email', 'Email', true], ['location', 'Location', false],
                ].map(([name, label, required]) => (
                  <div className="field-wrap" key={name}>
                    <label htmlFor={`hotel-${name}`}>{label}{required ? ' *' : ''}</label>
                    <input id={`hotel-${name}`} name={name} value={formData[name]} onChange={handleFieldChange} required={required} type={name === 'email' ? 'email' : 'text'} />
                  </div>
                ))}
                <h4 className="hotel-form-section-title hotel-form-wide">Optional information</h4>
                {[
                  ['website', 'Website', false], ['latitude', 'Latitude', false], ['longitude', 'Longitude', false], ['starRating', 'Star rating', true], ['image', 'Image URL', false],
                ].map(([name, label, required]) => (
                  <div className="field-wrap" key={name}>
                    <label htmlFor={`hotel-${name}`}>{label}{required ? ' *' : ''}</label>
                    <input id={`hotel-${name}`} name={name} value={formData[name]} onChange={handleFieldChange} required={required} type={['latitude', 'longitude', 'starRating'].includes(name) ? 'number' : 'text'} min={name === 'starRating' ? 1 : undefined} max={name === 'starRating' ? 5 : undefined} step={['latitude', 'longitude'].includes(name) ? 'any' : undefined} />
                  </div>
                ))}
                <div className="field-wrap hotel-form-wide">
                  <label htmlFor="hotel-description">Description</label>
                  <textarea id="hotel-description" name="description" value={formData.description} onChange={handleFieldChange} rows="3" />
                </div>
                <label className="hotel-checkbox hotel-form-wide">
                  <input type="checkbox" name="ecoFriendly" checked={formData.ecoFriendly} onChange={handleFieldChange} />
                  Eco-friendly property
                </label>
              </div>

              <div className="hotel-room-section">
                <div className="hotel-modal-header">
                  <div>
                    <h4>Rooms</h4>
                    <p className="hotel-helper">Add at least one room before requesting a suggested price.</p>
                  </div>
                  <button type="button" className="outline-btn small-btn" onClick={() => setFormData((current) => ({ ...current, rooms: [...current.rooms, emptyRoom()] }))}>Add room</button>
                </div>
                {formData.rooms.map((room, index) => (
                  <div className="hotel-room-row" key={index}>
                    <div className="field-wrap"><label htmlFor={`room-type-${index}`}>Room type</label><select id={`room-type-${index}`} name="roomType" value={room.roomType} onChange={(event) => handleRoomChange(index, event)}><option>Standard</option><option>Deluxe</option><option>Premium</option><option>Suite</option><option>Cottage</option></select></div>
                    <div className="field-wrap"><label htmlFor={`room-capacity-${index}`}>Capacity *</label><input id={`room-capacity-${index}`} name="capacity" type="number" min="1" value={room.capacity} onChange={(event) => handleRoomChange(index, event)} required /><small>Maximum guests this room can accommodate.</small></div>
                    <div className="field-wrap"><label htmlFor={`room-total-${index}`}>Total rooms *</label><input id={`room-total-${index}`} name="totalRooms" type="number" min="1" value={room.totalRooms} onChange={(event) => handleRoomChange(index, event)} required /><small>The total number of rooms of this type.</small></div>
                    <div className="field-wrap"><label htmlFor={`room-available-${index}`}>Available rooms *</label><input id={`room-available-${index}`} name="availableRooms" type="number" min="0" value={room.availableRooms} onChange={(event) => handleRoomChange(index, event)} required /><small>Rooms currently open for booking.</small></div>
                    <div className="field-wrap"><label htmlFor={`room-price-${index}`}>Base price *</label><input id={`room-price-${index}`} name="basePrice" type="number" min="0" step="0.01" value={room.basePrice} onChange={(event) => handleRoomChange(index, event)} required /><small>Current room price used for suggestions.</small></div>
                    <div className="field-wrap hotel-room-wide"><label htmlFor={`room-description-${index}`}>Description</label><input id={`room-description-${index}`} name="description" value={room.description} onChange={(event) => handleRoomChange(index, event)} /></div>
                    <div className="field-wrap hotel-room-wide"><label htmlFor={`room-amenities-${index}`}>Amenities</label><input id={`room-amenities-${index}`} name="amenities" value={room.amenities} onChange={(event) => handleRoomChange(index, event)} placeholder="WiFi, Balcony" /></div>
                    {formData.rooms.length > 1 && <button type="button" className="danger-btn small-btn" onClick={() => setFormData((current) => ({ ...current, rooms: current.rooms.filter((_, roomIndex) => roomIndex !== index) }))}>Remove</button>}
                  </div>
                ))}
              </div>

              <div className="hotel-form-actions">
                <button type="button" className="outline-btn" onClick={closeForm} disabled={submitting}>Cancel</button>
                <button type="submit" className="success-btn" disabled={submitting}>{submitting ? 'Saving...' : editingHotel ? 'Save changes' : 'Create hotel'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hotels;
