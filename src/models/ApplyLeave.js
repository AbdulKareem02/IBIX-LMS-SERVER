const mongoose = require("mongoose");

const applyLeaveSchema = new mongoose.Schema({
  employeeName: { type: String, required: true },
  employeeId: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  leaveType: { type: String, required: true },
  reason: { type: String, required: true },
  contactInfo: { type: String, required: true },
  status: { type: String, required: true },
});

module.exports = mongoose.model("EmployeeLeave", applyLeaveSchema);
