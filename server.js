const express = require('express');
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const pdf = require('html-pdf');
const fs = require('fs');
const authRouter = require('./routes/authRouter');
const userAuthRouter = require('./routes/userAuthRoute');
const attendanceRoute = require('./routes/attendanceRouter');
const employeeRouter = require('./routes/employeeRouter');
const reportRouter = require('./routes/reportRouter');
const authenticateToken = require('./middlewares/authenticateUser');
const leaveRequestRouter=require('./routes/leaveRequestRouter')
const teamRouter=require('./routes/teamRouter')
const documentRouter = require('./routes/documentRouter');
const bankDetailsRouter = require('./routes/bankDetailsRouter'); 
const bodyParser = require('body-parser');

dotenv.config();

// @initializing prisma and express app
const prisma = new PrismaClient();
const app = express();

app.use(bodyParser.json({ limit: '2mb' })); // Adjust limit as needed
app.use(bodyParser.urlencoded({ limit: '2mb', extended: true })); //

// Configure CORS
app.use(cors({
  // origin: 'http://localhost:5173',
 origin: 'https://qubinest-frontend.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    body: req.body,
    query: req.query,
    params: req.params
  });
  next();
});

// @middlewares
app.use(express.json());
app.use('/qubinest', authRouter);
app.use('/qubinest', attendanceRoute);
app.use('/qubinest', employeeRouter);
app.use(morgan('dev'));
app.use(cookieParser());
app.use('/qubinest', reportRouter);
app.use('/qubinest', userAuthRouter);
app.use('/qubinest', leaveRequestRouter);
app.use('/qubinest', teamRouter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/bankdetails', bankDetailsRouter);

app.use('/documents', documentRouter);
// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Dynamic route to render the requested document with employee data


// API to save or update bank details


// @prisma config
async function shutdown() {
    await prisma.$disconnect();
    process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
const PORT = process.env.PORT || 3000;

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Add this after all your routes
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });

});

// @starting app
app.get("/", (req, res) => {
    res.send("API is working fine");
});

app.get("/test", (req, res) => {
    res.send("This is a test");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});
