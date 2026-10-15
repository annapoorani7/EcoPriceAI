const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const hotelRoutes = require('./routes/hotelRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const pricingRoutes = require('./routes/pricingRoutes');
const eventRoutes = require('./routes/eventRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const ecopulseRoutes = require('./routes/ecopulseRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'EcoPrice AI backend is running',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/ecopulse', ecopulseRoutes);

app.use((err, req, res, next) => {
  console.error('Server error:', err.message);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
