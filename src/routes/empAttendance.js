// routes/attendance.js
const express = require("express");
const route = express.Router();
const Attendance = require("../models/EmpAttendance");
const Leaves = require("../models/ApplyLeave");
const verifyJWTAccess = require("../middleware/verifyJWTAccess");
/**
 * Helper: format a Date to YYYY-MM-DD in server local timezone
 */
function toYMD(date = new Date()) {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * POST /api/attendance/clockin
 * body: { employeeId: string }
 */
route.post("/clockin", async (req, res) => {
  const { employeeId } = req.body;

  try {
    if (!employeeId)
      return res.status(400).json({ error: "employeeId required" });

    const today = toYMD(new Date());

    // If a record already exists for today, reject (one clock-in per day)
    const existing = await Attendance.findOne({ employeeId, date: today });
    if (existing) {
      return res
        .status(400)
        .json({ error: "Already clocked in (or record exists) for today." });
    }

    const doc = new Attendance({
      employeeId,
      date: today,
      clockIn: new Date(),
      status: "incomplete",
    });

    await doc.save();
    return res.json({ message: "Clocked in", attendance: doc });
  } catch (err) {
    console.error("clockin error:", err);
    if (err.code === 11000)
      return res.status(400).json({ message: "Already clocked in today." });
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * POST /api/attendance/clockout
 * body: { employeeId: string }
 * Enforces minimum 5 hours between clockIn and clockOut.
 */
route.post("/clockout", async (req, res) => {
  const { employeeId } = req.body;
  try {
    if (!employeeId)
      return res.status(400).json({ error: "employeeId required" });

    const today = toYMD(new Date());
    const rec = await Attendance.findOne({ employeeId, date: today });
    if (!rec)
      return res
        .status(400)
        .json({ error: "No clock-in record found for today." });

    if (rec.clockOut)
      return res.status(400).json({ error: "Already clocked out for today." });
    if (!rec.clockIn)
      return res
        .status(400)
        .json({ error: "Record invalid: missing clockIn." });

    // Calculate worked hours
    const diffMs = new Date() - new Date(rec.clockIn);
    const diffHours = diffMs / (1000 * 60 * 60);

    // Always allow clock-out
    rec.clockOut = new Date();

    if (diffHours < 5) {
      rec.status = "absent"; // less than 5 hours worked
    } else {
      rec.status = "present"; // 5 or more hours worked
    }

    await rec.save();

    return res.json({
      message: `Clocked out; attendance marked ${rec.status}.`,
      workedHours: diffHours.toFixed(2),
      attendance: rec,
    });
  } catch (err) {
    console.error("clockout error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET /api/attendance/calendar/:employeeId?year=YYYY&month=M
 * Returns array of day objects for the requested month.
 * Each item: { date: "YYYY-MM-DD", status: "present"|"incomplete"|"absent", clockIn, clockOut }
 */
// helper
function toYMD(date = new Date()) {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

route.get("/calendar/:employeeId", async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { year, month } = req.query; // month = 1..12

    if (!year || !month) {
      return res.status(400).json({ message: "year and month are required" });
    }

    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate = `${year}-${String(month).padStart(2, "0")}-${new Date(
      year,
      month,
      0
    ).getDate()}`;
    const todayYMD = toYMD(new Date());

    // fetch all records for that month
    const attendanceRecords = await Attendance.find({
      employeeId,
      date: { $gte: startDate, $lte: endDate },
    });

    // build record map
    const recordMap = {};
    attendanceRecords.forEach((rec) => {
      const hoursWorked =
        rec.clockIn && rec.clockOut
          ? (
              (new Date(rec.clockOut) - new Date(rec.clockIn)) /
              (1000 * 60 * 60)
            ).toFixed(2)
          : 0;

      recordMap[rec.date] = {
        date: rec.date,
        status: rec.status, // keep DB status first
        clockIn: rec.clockIn,
        clockOut: rec.clockOut,
        hoursWorked,
      };
    });

    // build month array
    const daysInMonth = new Date(year, month, 0).getDate();
    const calendarData = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const key = `${year}-${String(month).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;

      let record = recordMap[key] || {
        date: key,
        status: "absent",
        clockIn: null,
        clockOut: null,
        hoursWorked: 0,
      };

      // ✅ handle today specially
      if (key === todayYMD) {
        if (record.clockIn && !record.clockOut) {
          record.status = "incomplete"; // orange
        } else if (record.clockIn && record.clockOut) {
          record.status = record.hoursWorked >= 5 ? "present" : "absent";
        } else {
          record.status = "upcoming"; // 🟡 neutral instead of red before clock-in
        }
      }

      // ✅ future dates
      if (key > todayYMD) {
        record = {
          date: key,
          status: "upcoming",
          clockIn: null,
          clockOut: null,
          hoursWorked: 0,
        };
      }

      calendarData.push(record);
    }

    res.json(calendarData);
  } catch (error) {
    console.error("calendar error:", error);
    res.status(500).json({ message: error.message });
  }
});

route.post("/apply-leave", async (req, res) => {
  try {
    const {
      employeeName,
      employeeId,
      leaveType,
      startDate,
      endDate,
      reason,
      contactInfo,
      status,
    } = req.body;

    const result = await Leaves.insertOne({
      employeeName,
      employeeId,
      leaveType,
      startDate,
      endDate,
      contactInfo,
      reason,
      status,
      createdAt: new Date(), // optional timestamp
    });

    res.status(201).json({
      message: "Leave application submitted successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error while applying leave:", error);
    res.status(400).json({ error: "Something went wrong" });
  }
});

route.get("/leaves/:mail", async (req, res) => {
  try {
    const { mail } = req.params;

    const leaves = await Leaves.find({ mail });

    if (!leaves || leaves.length === 0) {
      return res
        .status(404)
        .json({ message: "No leaves found for this email" });
    }

    res.status(200).json({
      message: "Leaves fetched successfully",
      data: leaves,
    });
  } catch (error) {
    console.error("Error while fetching leaves:", error);
    res.status(400).json({ error: "Something went wrong" });
  }
});

module.exports = route;
