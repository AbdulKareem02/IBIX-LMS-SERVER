require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});

const express = require("express");
const app = express();
app.use(express.json());

const cors = require("cors");
app.use(cors()); //hide this when code updating in git
// const cors = require("cors");

// app.use(cors({
//   origin: "https://yourapp.vercel.app", // allow only your frontend
//   credentials: true, // allow cookies
// }));

const port = process.env.PORT || 6000;

const connectDB = require("./config/db");

connectDB(process.env.MONGO_URI);

const studentRoutes = require("./routes/studentRoutes");

// routes
app.use("/ibix-api/", studentRoutes);
app.use("/ibix-api", studentRoutes);

try {
  app.listen(port, () => {
    console.log(`Server running at port ${port}`);
  });
} catch (error) {
  console.log(error.message);
}
