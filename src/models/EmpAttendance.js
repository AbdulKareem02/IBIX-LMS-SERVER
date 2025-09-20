// models/Attendance.js
const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true, index: true },
    date: { type: String, required: true }, // YYYY-MM-DD (server local)
    clockIn: { type: Date, default: null },
    clockOut: { type: Date, default: null },
    status: {
      type: String,
      enum: ["absent", "incomplete", "present", "upcoming"],
    },
  },
  { timestamps: true }
);

AttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Employee Attendance", AttendanceSchema);
