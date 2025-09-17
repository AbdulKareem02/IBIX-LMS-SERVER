const studentModel = require("../models/users");

exports.getStudentDetails = async (req, res) => {
  try {
    // 1️⃣ Fetch data from Google Sheets
    const sheetResponse = await fetch(
      "https://script.google.com/macros/s/AKfycbyR-reuGHoqY423GXXU4raFan_yuicooaLI-4qAZA7O1Flq4J_Mn4ADqlV6mQ_pFBJt/exec"
    );

    if (!sheetResponse.ok) {
      throw new Error(`Google Sheets API error: ${sheetResponse.statusText}`);
    }

    const sheetData = await sheetResponse.json(); // Array of student objects
    // 2️⃣ Get all existing studentIds from DB
    const existingStudents = await studentModel
      .find({}, { studentId: 1 })
      .lean();
    const existingIds = new Set(existingStudents.map((s) => s.studentId));

    // 3️⃣ Filter only new students (skip existing ones)
    const newStudents = sheetData.filter((s) => !existingIds.has(s.studentId));

    // 4️⃣ Insert only new students
    if (newStudents.length > 0) {
      await studentModel.insertMany(newStudents, { ordered: false });
      console.log(`${newStudents.length} new students added`);
    } else {
      console.log("No new students to add");
    }

    // 5️⃣ Validate request body
    const { employee } = req.body;
    if (!employee) {
      return res.status(400).json({
        message: "Validation error: missing 'employee' field",
      });
    }

    // 6️⃣ Return students filtered by employee
    const filteredStudents = await studentModel.find({ employee }).exec();

    res.status(200).json({
      message: "Student data synced successfully",
      inserted: newStudents.length,
      data: filteredStudents,
    });
  } catch (error) {
    console.error("Error syncing student data:", error);
    res.status(500).json({
      message: "Failed to sync student data",
      error: error.message,
    });
  }
};
