require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') }); // Points to backend/.env

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes'); 
const { checkDbConnection } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const s3Routes = require('./routes/s3Routes');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api/s3', s3Routes);

// Routes
app.get('/', (req, res) => {
  res.send('User Management API is running!');
});
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);


app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  if (!res.headersSent) {
    res.status(500).send('Something broke!');
  }
  next(err); 
});

const PORT = process.env.PORT || 3001;

async function startApplication() {
  

  const dbConnected = await checkDbConnection(); // Now await is correctly inside an async function

  if (dbConnected) {
    console.log('[Application Start] Database connection successful.');
    app.listen(PORT, () => {
      console.log(`[Application Start] HTTP Server is now running on port ${PORT}`);
    });
  } else {
    console.error('[Application Start] CRITICAL: Database connection failed. Application will not start properly.');
  }
}

startApplication().catch(error => {
  console.error('[Application Start] A critical error occurred during startup:', error);
  process.exit(1); 
});