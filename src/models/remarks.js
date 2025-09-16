const mongoose = require("mongoose");

const remarkEntrySchema = new mongoose.Schema({
  remark: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, required: true },
  datetime: { type: Date, default: Date.now },
  date: { type: String },
  author: { type: String, required: true },
});

const remarksSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  remarks: [remarkEntrySchema],
});

module.exports = mongoose.model("Remarks", remarksSchema);
