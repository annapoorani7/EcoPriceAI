const mongoose = require('mongoose');
const Hotel = require('../models/Hotel');

const createHotel = async (req, res) => {
  try {
    const {
      name,
      description,
      location,
      address,
      city,
      state,
      country,
      latitude,
      longitude,
      phone,
      email,
      website,
      hotelType,
      starRating,
      amenities,
      images,
      ecoFriendly,
      sustainabilityFeatures,
      conservationPrograms,
      localActivities,
      rooms,
    } = req.body;

    if (!name || !address || !city || !state || !country || !phone || !email || !hotelType || !rooms || rooms.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Required hotel fields are missing',
      });
    }

    const hotel = await Hotel.create({
      name,
      description: description || '',
      location: location || '',
      address,
      city,
      state,
      country,
      latitude: latitude || 0,
      longitude: longitude || 0,
      phone,
      email,
      website: website || '',
      hotelType,
      starRating: starRating || 3,
      amenities: amenities || [],
      images: images || [],
      ecoFriendly: Boolean(ecoFriendly),
      sustainabilityFeatures: sustainabilityFeatures || [],
      conservationPrograms: conservationPrograms || [],
      localActivities: localActivities || [],
      rooms,
      owner: req.user._id,
    });

    const populatedHotel = await Hotel.findById(hotel._id).populate('owner', 'name role');

    return res.status(201).json({
      success: true,
      message: 'Hotel created successfully',
      hotel: populatedHotel,
    });
  } catch (error) {
    console.error('Create hotel error:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error while creating hotel',
    });
  }
};

const getMyHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ owner: req.user._id }).populate('owner', 'name email role');

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'No hotel is associated with this account yet.',
      });
    }

    return res.status(200).json({ success: true, hotel });
  } catch (error) {
    console.error('Get owner hotel error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to load your hotel profile right now.',
    });
  }
};

const updateMyHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ owner: req.user._id });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'No hotel is associated with this account yet.',
      });
    }

    ['name', 'email', 'phone', 'address'].forEach((field) => {
      if (req.body[field] !== undefined) {
        hotel[field] = req.body[field];
      }
    });

    const updatedHotel = await hotel.save();
    await updatedHotel.populate('owner', 'name email role');

    return res.status(200).json({
      success: true,
      message: 'Hotel profile updated successfully.',
      hotel: updatedHotel,
    });
  } catch (error) {
    console.error('Update owner hotel error:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }

    return res.status(500).json({
      success: false,
      message: 'Unable to save your hotel profile right now.',
    });
  }
};

const getHotels = async (req, res) => {
  try {
    const {
      city,
      state,
      hotelType,
      ecoFriendly,
      minPrice,
      maxPrice,
      search,
    } = req.query;

    const filter = req.user.role === 'admin' ? {} : { owner: req.user._id };

    if (city) filter.city = { $regex: city, $options: 'i' };
    if (state) filter.state = { $regex: state, $options: 'i' };
    if (hotelType) filter.hotelType = { $regex: hotelType, $options: 'i' };
    if (ecoFriendly !== undefined) filter.ecoFriendly = ecoFriendly === 'true';

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    if (minPrice || maxPrice) {
      const priceFilter = {};

      if (minPrice) priceFilter.$gte = Number(minPrice);
      if (maxPrice) priceFilter.$lte = Number(maxPrice);

      filter.rooms = {
        $elemMatch: {
          basePrice: priceFilter,
        },
      };
    }

    const hotels = await Hotel.find(filter).populate('owner', 'name role').sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: hotels.length,
      hotels,
    });
  } catch (error) {
    console.error('Get hotels error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching hotels',
    });
  }
};

const getHotelById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid hotel ID',
      });
    }

    const hotel = await Hotel.findById(id).populate('owner', 'name role');

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found',
      });
    }

    if (req.user.role !== 'admin' && hotel.owner?._id?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this hotel',
      });
    }

    return res.status(200).json({
      success: true,
      hotel,
    });
  } catch (error) {
    console.error('Get hotel error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching hotel',
    });
  }
};

const updateHotel = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid hotel ID',
      });
    }

    const hotel = await Hotel.findById(id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found',
      });
    }

    if (req.user.role !== 'admin' && hotel.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this hotel',
      });
    }

    const allowedFields = [
      'name',
      'description',
      'location',
      'address',
      'city',
      'state',
      'country',
      'latitude',
      'longitude',
      'phone',
      'email',
      'website',
      'hotelType',
      'starRating',
      'amenities',
      'images',
      'ecoFriendly',
      'sustainabilityFeatures',
      'conservationPrograms',
      'localActivities',
      'rooms',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        hotel[field] = req.body[field];
      }
    });

    const updatedHotel = await hotel.save();

    return res.status(200).json({
      success: true,
      message: 'Hotel updated successfully',
      hotel: updatedHotel,
    });
  } catch (error) {
    console.error('Update hotel error:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error while updating hotel',
    });
  }
};

const deleteHotel = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid hotel ID',
      });
    }

    const hotel = await Hotel.findById(id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found',
      });
    }

    if (req.user.role !== 'admin' && hotel.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this hotel',
      });
    }

    await hotel.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Hotel deleted successfully',
    });
  } catch (error) {
    console.error('Delete hotel error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting hotel',
    });
  }
};

module.exports = {
  createHotel,
  getMyHotel,
  updateMyHotel,
  getHotels,
  getHotelById,
  updateHotel,
  deleteHotel,
};
