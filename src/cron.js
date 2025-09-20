// cron.js
const cron = require("node-cron");
const Attendance = require("./models/Attendance");

function toYMD(date = new Date()) {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Run every day at midnight server time
cron.schedule("0 0 * * *", async () => {
  const yesterday = toYMD(new Date(Date.now() - 24 * 60 * 60 * 1000));
  try {
    const res = await Attendance.updateMany(
      { date: { $lte: yesterday }, status: "incomplete" },
      { $set: { status: "absent" } }
    );
    console.log(
      `[CRON] Updated missed clock-outs → absent:`,
      res.modifiedCount
    );
  } catch (err) {
    console.error("[CRON] Error updating attendance:", err);
  }
});
