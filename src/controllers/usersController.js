const studentModel = require("../models/users");

exports.getStudentDetails = async (req, res) => {
  try {
    const { employee } = req.body;

    // ✅ Validate input
    if (!employee) {
      return res.status(400).json({
        message: "Validation error: missing 'employee' field",
      });
    }

    // ✅ Just fetch from MongoDB and send back
    const students = await studentModel.find({ employee }).exec();

    res.status(200).json({
      message: "Student data fetched successfully",
      data: students,
    });
  } catch (error) {
    console.error("Error fetching student data:", error);
    res.status(500).json({
      message: "Failed to fetch student data",
      error: error.message,
    });
  }
};
