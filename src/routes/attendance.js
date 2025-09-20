const express = require("express");
const Attendance = require("../models/Attendance");
const router = express.Router();

// Clock In
router.post("/clock-in", async (req, res) => {
  try {
    const { name, mail, clockIn } = req.body;
    const date = new Date(clockIn).toISOString().split("T")[0];

    const attendance = new Attendance({ name, mail, clockIn, date });
    await attendance.save();

    res.status(201).json({ message: "Clock-in stored" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error storing clock-in", error: err.message });
  }
});

// Clock Out
router.post("/clock-out", async (req, res) => {
  try {
    const { name, mail, clockIn, clockOut, date, totalHours } = req.body;

    const attendance = await Attendance.findOneAndUpdate(
      { name, mail, date },
      { clockIn, clockOut, totalHours },
      { new: true, upsert: true }
    );

    res.status(200).json({ message: "Clock-out stored", attendance });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error storing clock-out", error: err.message });
  }
});

module.exports = router;
