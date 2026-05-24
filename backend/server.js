import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { connectDB, getDbStatus } from './config/db.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import donorRoutes from './routes/donorRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';

// Middleware imports
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Load ENV variables
dotenv.config();

// Connect Database
connectDB();

const app = express();

// Standard Middlewares
app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// API Health Check
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    database: getDbStatus(),
    timestamp: new Date().toISOString(),
    apiDocs: {
      auth: '/api/auth',
      donors: '/api/donors',
      inventory: '/api/inventory',
      requests: '/api/requests',
      appointments: '/api/appointments',
      dashboard: '/api/dashboard',
      notifications: '/api/notifications',
      chatbot: '/api/chatbot'
    }
  });
});

// Routes Registration
app.use('/api/auth', authRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
