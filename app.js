import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import fileUpload from "express-fileupload";

import artistRouter from "./backend/routes/artistRoutes.js";
import genreRouter from "./backend/routes/genreRoutes.js";
import albumRouter from "./backend/routes/albumRoutes.js";
import trackRouter from "./backend/routes/trackRoutes.js";
import { setupAssociations } from "./backend/models/associations.js"; // Import the setupAssociations function

const app = express();

// Middleware to log raw request body
app.use(fileUpload());
app.use((req, res, next) => {
  let data = "";
  req.on("data", (chunk) => {
    data += chunk;
  });
  req.on("end", () => {
    console.log("Raw Request Body:", data);
    next();
  });
});

// Use CORS middleware
app.use(cors()); // This will allow all origins.

// Middleware to parse JSON requests
// app.use(bodyParser.json());

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
