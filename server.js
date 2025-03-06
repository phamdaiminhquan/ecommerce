const routes = require("./routes");
const bodyParser = require('body-parser');
const cors = require("cors");
const express = require('express');
const connectDB = require('./config/database');


const app = express();
app.use(express.json());
app.use(cors());

// Port
const PORT = process.env.PORT || 3000;

// Kết nối đến MongoDB Atlas
connectDB();

// Routes
app.use("/api", routes);

// Middleware
app.use(bodyParser.json());

// Khởi động server
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng http://localhost/${PORT}`);
});
