const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const axios = require("axios");
const cors = require("cors");
const helmet = require("helmet");
const { auth } = require("express-oauth2-jwt-bearer");
const Room = require("./Room");

const app = express();
// load environment variables
dotenv.config();
const upload = require("./upload");

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;
const ORIGIN = process.env.ORIGIN;

app.use(
  cors({
    origin: ORIGIN,
    credentials: true,
  }),
);
app.use(express.json());
app.use(helmet());

// connect to database
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB Database connected successfully"))
  .catch((err) => {
    console.error("Database connection error", err);
    process.exit(1); // stop app if db fails
  });

// user authentication
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: "RS256",
});

// route to create new room
app.post(
  "/api/v1/room",
  checkJwt,
  upload.array("files", 3),
  async (req, res) => {
    try {
      // get ID of authenticated user
      const partnerId = req.auth.payload.sub;

      // extract s3 urls from uploaded files
      const pictureUrls = req.files
        ? req.files.map((file) => file.location)
        : [];

      // check if room already exists (first)
      const { title } = req.body;
      const roomExist = await Room.findOne({ title, partnerId });
      if (roomExist) {
        return res
          .status(400)
          .json({ message: "Room already exists or unauthorized user." });
      }

      const roomData = new Room({
        title: req.body.title,
        capacity: req.body.capacity,
        basePrice: req.body.basePrice,
        location: req.body.location,
        pictures: pictureUrls,
        partnerId,
      });

      // if not, save in DB (for partner)
      await roomData.save();
      res.status(201).json(roomData);
    } catch (error) {
      console.error("Error creating room:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
);

// route to get all rooms (search/filter logic)
app.get("/api/v1/rooms", async (req, res) => {
  try {
    // Extract parameters from request query
    const title = req.query.title;
    const location = req.query.location;
    const capacity = req.query.capacity;
    const price = req.query.price;

    // Dynamic query based on parameters
    const query = {};

    // Search for specific title
    if (title) {
      query.title = { $regex: title, $options: "i" };
    }

    // Search for specific location
    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    // Filter by capacity
    if (capacity) {
      query.capacity = capacity;
    }

    // Filter by price
    if (price) {
      query.basePrice = price;
    }

    // Perform final query
    const rooms = await Room.find(query);

    res.status(200).json(rooms);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// route to get all rooms by partner
app.get("/api/v1/rooms/by-partner", checkJwt, async (req, res) => {
  try {
    const partnerId = req.auth.payload.sub;

    const rooms = await Room.find({ partnerId });
    res.status(200).json(rooms);
  } catch (error) {
    console.error("Error fetching rooms for partner:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// route to get specific room by ID (during booking)
app.get("/api/v1/rooms/:id", async (req, res) => {
  try {
    id = req.params.id;
    const roomData = await Room.findOne({ _id: id });

    if (!roomData) {
      return res.status(404).json({ message: "Room Not Found." });
    }

    res.status(200).json(roomData);
  } catch (error) {
    console.error("Error fetching room:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// route to update specific room (for partner)
app.put("/api/v1/rooms/:id", checkJwt, async (req, res) => {
  try {
    const partnerId = req.auth.payload.sub;

    const id = req.params.id;
    const roomExist = await Room.findOne({ _id: id, partnerId });

    if (!roomExist) {
      return res
        .status(404)
        .json({ message: "Room Not Found or Unauthorized User." });
    }

    const updatedRoom = await Room.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(201).json(updatedRoom);
  } catch (error) {
    console.error("Error updating room:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// route to delete specific room
app.delete("/api/v1/rooms/:id", checkJwt, async (req, res) => {
  try {
    const partnerId = req.auth.payload.sub;

    const id = req.params.id;
    const roomExist = await Room.findOne({ _id: id, partnerId });

    if (!roomExist) {
      return res
        .status(404)
        .json({ message: "Room Not Found or Unauthorized User." });
    }

    await Room.findByIdAndDelete(id);
    res.status(201).json({ message: "Room deleted successfully." });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// start server
app.listen(PORT, () => {
  console.log(`Listening at localhost:${PORT}`);
});
