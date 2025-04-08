import express from 'express';
import cors from 'cors';
import session from 'express-session';
import flash from 'connect-flash';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/authRoutes';
import db from './config/db';


// Load environment variables
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Middleware
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Session & Flash
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));

app.use(flash());

// Routes
app.use('/api/auth', authRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});