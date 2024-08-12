const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./database/db");
const cors = require("cors");
const cloudinary = require("cloudinary");
const acceptMultimedia = require("connect-multiparty");
const morgan = require("morgan"); // You had declared 'morgan' twice, removed duplication

// Making express app
const app = express();

// Middleware setup
app.use(morgan("combined"));
dotenv.config(); // dotenv config

// cloudinary config
cloudinary.config({
  cloud_name: "dvf4m5jsa",
  api_key: "896523414486959",
  api_secret: "7Nl3HZE0utjHO3dNbiUUARfT3jc",
});

app.use(acceptMultimedia());

// cors config to accept request from frontend
const corsOptions = {
  origin: true,
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

// mongodb connection
connectDB();

// Accepting json data  `
app.use(express.json());

// Routes
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/product", require("./routes/productRoutes"));
app.use("/api/user", require("./routes/cartRoutes")); 
app.use("/api/user", require("./routes/orderRoutes")); 
app.use("/api/user", require("./routes/favoriteRoutes")); 

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
