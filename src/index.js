require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const financialResultsRouter = require('./routes/financialResults');

const app = express();
const port = process.env.PORT || 3000;

// Validate required environment variables
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_KEY'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`Error: ${envVar} is not set in environment variables`);
        process.exit(1);
    }
}

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api', financialResultsRouter);

// Serve admin dashboard
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Basic route for testing
app.get('/', (req, res) => {
    res.json({ message: 'Financial Results Dashboard API is running' });
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 