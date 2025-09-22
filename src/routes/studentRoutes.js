const express = require("express");
const mongoose = require("mongoose");

const { getStudentDetails } = require("../controllers/usersController");
const { loginEmployee } = require("../controllers/employeesController");
const route = express.Router();
const Call = require("../models/users");
const Remarks = require("../models/remarks");
const verifyJWTAccess = require("../middleware/verifyJWTAccess");

route.post("/get-students", verifyJWTAccess, getStudentDetails);

route.post("/update-students", async (req, res) => {
  try {
    const newLead = await Call.create(req.body); // insert JSON directly
    res.status(201).json(newLead);
  } catch (err) {
    console.error("Error inserting lead:", err);
    res.status(400).json({ message: err.message });
  }
});

// Update call status
route.put("/calls/update/:studentId", verifyJWTAccess, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { status, remark } = req.body;

    const call = await Call.findOneAndUpdate(
      { studentId },
      { $set: { status }, $push: { remarks: { remark, date: new Date() } } },
      { new: true }
    );

    if (!call) return res.status(404).json({ message: "Call not found" });

    res.json({ message: "Call updated successfully", call });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Add a new remark for a student
route.post("/remarks", async (req, res) => {
  try {
    const { studentId, remark, content, type, datetime, date, author } =
      req.body;

    if (!studentId || !remark || !author) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newRemark = {
      remark,
      content,
      type,
      datetime: datetime || new Date(),
      date: date || new Date().toISOString().split("T")[0],
      author,
    };

    // Push new remark or create new doc if not exists
    const updatedDoc = await Remarks.findOneAndUpdate(
      { studentId },
      { $push: { remarks: newRemark } },
      { new: true, upsert: true }
    );

    res.status(201).json({
      message: "Remark added successfully",
      data: updatedDoc,
    });
  } catch (error) {
    console.error("Error adding remark:", error);
    res.status(500).json({
      message: "Failed to add remark",
      error: error.message,
    });
  }
});

route.post("/get-remarks", verifyJWTAccess, async (req, res) => {
  try {
    const { studentId } = req.body;
    if (!studentId) {
      return res.status(400).json({ message: "studentId is required" });
    }

    const findRemarks = await Remarks.find({ studentId });

    res.status(200).json({
      data: findRemarks,
    });
  } catch (error) {
    console.error("Error fetching remarks:", error);
    res.status(500).json({
      message: "Failed to fetch remarks",
      error: error.message,
    });
  }
});

route.post("/employees/login", loginEmployee);

// Mongo model
const Row = mongoose.model(
  "Row",
  new mongoose.Schema({
    rowNumber: Number,
    sheetName: String,
    data: [String],
  })
);

// Webhook endpoint
route.post("/sheets-webhook", async (req, res) => {
  try {
    const { rowNumber, data, sheetName } = req.body;

    // Upsert row into MongoDB
    await Row.updateOne(
      { rowNumber, sheetName },
      { rowNumber, sheetName, data },
      { upsert: true }
    );

    res.status(200).json({ message: "Row synced successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = route;
