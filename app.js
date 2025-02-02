const express = require("express");
const cors = require("cors");
const connectDB = require("./config/mongodb");
require("dotenv").config();

const faqRoutes = require("./routes/faq.routes");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.use("/api", faqRoutes);

app.listen(process.env.PORT || 3000);
