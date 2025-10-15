require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});

// require("./cron");

const express = require("express");
const app = express();
app.use(express.json());

const cors = require("cors");

//hide this when code updating in git
app.use(cors());

const allowedOrigins = "https://ibra.ibixqt.in/";

// comment for this development only
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Important to allow cookies/authorization headers
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"], // Ensure Authorization header is allowed
  })
);

const port = process.env.PORT || 6000;

const connectDB = require("./config/db");

connectDB(process.env.MONGO_URI);

const studentRoutes = require("./routes/studentRoutes");
const attendanceRoutes = require("./routes/attendance");
const empAttendanceRoutes = require("./routes/empAttendance");

// routes
app.use("/ibix-api/", studentRoutes);
app.use("/ibix-api/attendance/", attendanceRoutes);
app.use("/ibix-api/emp-attendance", empAttendanceRoutes);

// Built-in body parser
app.use(express.urlencoded({ extended: true }));

try {
  app.listen(port, () => {
    console.log(`Server running at port ${port}`);
  });
} catch (error) {
  console.log(error.message);
}
