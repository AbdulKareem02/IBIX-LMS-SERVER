const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mail: { type: String, required: true },
  clockIn: { type: Date },
  clockOut: { type: Date },
  date: { type: String, required: true },
  totalHours: { type: Number, default: 0 },
});

module.exports = mongoose.model("Attendance", attendanceSchema);
