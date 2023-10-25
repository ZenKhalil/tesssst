import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";

import artistRouter from "./backend/routes/artistRoutes.js";
import genreRouter from "./backend/routes/genreRoutes.js";
import albumRouter from "./backend/routes/albumRoutes.js";
import trackRouter from "./backend/routes/trackRoutes.js";
import { setupAssociations } from "./backend/models/associations.js"; // Import the setupAssociations function

const app = express();

// Use CORS middleware
app.use(cors()); // This will allow all origins.

// Middleware to parse JSON requests
app.use(express.json());

// Middleware to handle file uploads
app.use(fileUpload());

// Middleware to log raw request body for debugging
// Note: This is for debugging purposes and can be removed in production
app.use((req, res, next) => {
  if (req.method === "POST" || req.method === "PUT") {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      console.log("Raw Request Body:", data);
      next();
    });
  } else {
    next();
  }
});

// Set up associations
setupAssociations();

// Use routes
app.use("/genres", genreRouter);
app.use("/artists", artistRouter);
app.use("/albums", albumRouter);
app.use("/tracks", trackRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send(err.message);
});

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
