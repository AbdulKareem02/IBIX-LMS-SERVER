const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema({
  employee: { type: String, required: true },
  studentId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: Number, required: true },
  status: { type: String, default: "initial" },
  course: { type: String },
  email: { type: String },
  location: { type: String },
});

module.exports = mongoose.model("Student", leadSchema);
