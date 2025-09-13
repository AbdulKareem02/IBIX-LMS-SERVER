const express = require("express");
const { getStudentDetails } = require("../controllers/usersController");
const route = express.Router();

route.get("/get-students", getStudentDetails);

// Sync route for Google Sheets
route.post("/sync", async (req, res) => {
  const { action, row } = req.body;
  console.log(action, row);
  try {
    if (action === "update") {
      // Insert or update by studentId
      await getStudentDetails.updateOne(
        { studentId: row.studentId },
        { $set: row },
        { upsert: true }
      );
    } else if (action === "delete") {
      // Delete by studentId
      await getStudentDetails.deleteOne({ studentId: row.studentId });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Sync error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = route;
