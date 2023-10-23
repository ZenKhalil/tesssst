import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import artistRouter from './backend/routes/artistRoutes.js';
import albumRouter from './backend/routes/albumRoutes.js';
import trackRouter from './backend/routes/trackRoutes.js';
import { setupAssociations } from './backend/models/associations.js';  // Import the setupAssociations function

const app = express();

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Use CORS middleware
app.use(cors()); // This will allow all origins.

// Set up associations
setupAssociations();

// Use routes
app.use('/artists', artistRouter);
app.use('/albums', albumRouter);
app.use('/tracks', trackRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;
