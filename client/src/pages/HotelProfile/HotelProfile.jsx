import React, { useEffect, useState } from 'react';
import { hotelService } from '../../services/apiService';
import './HotelProfile.css';

const emptyValue = (value) => (value && String(value).trim() ? value : 'Not provided');

const HotelProfile = () => {
  const [hotel, setHotel] = useState(null);
  const [draft, setDraft] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let active = true;

    hotelService.getMyHotel()
      .then((response) => {
        if (!active) return;
        setHotel(response.hotel);
        setDraft({
          name: response.hotel.name || '',
          email: response.hotel.email || '',
          phone: response.hotel.phone || '',
          address: response.hotel.address || '',
        });
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Unable to load your hotel profile.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDraft((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await hotelService.updateMyHotel(draft);
      setHotel(response.hotel);
      setDraft({
        name: response.hotel.name || '',
        email: response.hotel.email || '',
        phone: response.hotel.phone || '',
        address: response.hotel.address || '',
      });
      setEditing(false);
      setSuccess('Hotel profile saved.');
    } catch (requestError) {
      setError(requestError.message || 'Unable to save your hotel profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="hotel-profile-page p-6 min-h-[calc(100vh-70px)]">Loading hotel profile...</div>;
  }

  return (
    <div className="hotel-profile-page p-6 min-h-[calc(100vh-70px)]">
      <div className="container mx-auto">
        {error && <div role="alert" className="mb-4 text-sm text-red-700">{error}</div>}
        {success && <div role="status" className="mb-4 text-sm text-green-700">{success}</div>}
        {!hotel ? (
          <div role="status" className="bg-white rounded-lg shadow p-6">No hotel profile is available for this account.</div>
        ) : (
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col md:flex-row gap-6 items-center">
            <img
              src={hotel.images?.find((image) => typeof image === 'string' && image.trim()) || '/logo192.png'}
              onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = '/logo192.png'; }}
              alt={`${hotel.name || 'Hotel'} logo`}
              className="w-28 h-28 object-cover rounded-lg"
            />
            <div className="flex-1">
              {editing ? (
                <input name="name" aria-label="Hotel name" value={draft.name} onChange={handleChange} className="text-2xl font-semibold px-2 py-1 border rounded-md w-full" />
              ) : (
                <h2 className="text-2xl font-semibold">{emptyValue(hotel.name)}</h2>
              )}
              <p className="text-sm text-gray-600 mt-1">Owned by <strong>{emptyValue(hotel.owner?.name)}</strong></p>

              <form id="hotel-profile-form" onSubmit={handleSave} className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  {editing ? (
                    <input name="email" type="email" value={draft.email} onChange={handleChange} className="mt-1 px-3 py-2 border rounded-md w-full" />
                  ) : (
                    <p className="text-sm">{emptyValue(hotel.email)}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  {editing ? (
                    <input name="phone" value={draft.phone} onChange={handleChange} className="mt-1 px-3 py-2 border rounded-md w-full" />
                  ) : (
                    <p className="text-sm">{emptyValue(hotel.phone)}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs text-gray-500">Address</p>
                  {editing ? (
                    <input name="address" value={draft.address} onChange={handleChange} className="mt-1 px-3 py-2 border rounded-md w-full" />
                  ) : (
                    <p className="text-sm">{emptyValue(hotel.address)}</p>
                  )}
                </div>
              </form>
            </div>

            <div className="flex flex-col gap-3 w-full md:w-auto">
              {editing ? (
                <>
                  <button form="hotel-profile-form" type="submit" disabled={saving} className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md">
                    {saving ? 'Saving...' : 'Save Profile'}
                  </button>
                  <button type="button" onClick={() => { setDraft({ name: hotel.name || '', email: hotel.email || '', phone: hotel.phone || '', address: hotel.address || '' }); setEditing(false); setError(''); }} className="py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded-md">Cancel</button>
                </>
              ) : (
                <button type="button" onClick={() => { setDraft({ name: hotel.name || '', email: hotel.email || '', phone: hotel.phone || '', address: hotel.address || '' }); setEditing(true); setSuccess(''); }} className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md">Edit Profile</button>
              )}
              <button type="button" onClick={() => alert('Change password flow (placeholder)')} className="py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded-md">Change Password</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelProfile;
