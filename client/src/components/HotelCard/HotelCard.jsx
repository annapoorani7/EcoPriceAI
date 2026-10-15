import React from 'react';
import './HotelCard.css';

const HotelCard = ({ hotel, onEdit, onDelete, deleting }) => {
  return (
    <div className="hotel-card bg-white rounded-2xl shadow-md overflow-hidden">
      {hotel.image ? (
        <img src={hotel.image} alt={hotel.name} className="w-full h-40 object-cover" />
      ) : (
        <div className="hotel-card-no-image">No image available</div>
      )}
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-800">{hotel.name}</h4>
            <p className="text-sm text-gray-500">{hotel.location}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Occupancy</p>
            <p className={`font-semibold ${hotel.occupancy !== null && hotel.occupancy >= 75 ? 'text-red-600' : 'text-green-600'}`}>{hotel.occupancy === null ? 'Not available' : `${hotel.occupancy}%`}</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>Available: <span className="font-medium text-gray-800">{hotel.availableRooms ?? 'Not available'}</span></div>
          <div>Price: <span className="font-medium text-gray-800">{hotel.price}</span></div>
        </div>

        <div className="flex items-center gap-3 mt-2">
          <button onClick={() => onEdit(hotel)} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md" disabled={deleting}>Edit</button>
          <button onClick={() => onDelete(hotel)} className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md" disabled={deleting}>{deleting ? 'Deleting...' : 'Delete'}</button>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;
