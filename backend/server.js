require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const connectDB = require('./config/db');
const cors = require('cors');
const helmet = require('helmet');
const predictionCron = require('./cron/predictionCron.js');
require('colors');


const app = express();
connectDB();

// Middleware
app.use(express.json());
app.use(morgan('dev'));
app.use(helmet());
app.use(cors({
  origin: '*', // Allow all origins temporarily for development
  credentials: true
}));

// Routes   
app.use('/api/auth', require('./routes/auth'));
app.use('/api/precautions', require('./routes/precaution'));
app.use('/api/safePlaces', require('./routes/safePlace'));
app.use("/api/prediction", require('./routes/predictionRoutes.js'));

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`.yellow.bold);
    predictionCron.initializePredictionCron();
});
