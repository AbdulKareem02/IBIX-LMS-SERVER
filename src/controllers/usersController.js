const studentModel = require("../models/users");

exports.getStudentDetails = async (req, res) => {
  try {
    const { employee } = req.query;

    // Validate required query parameters
    let validationErrors = [];

    if (!employee) validationErrors.push("Missing required field: employee");

    // Only return an error response if there are validation errors
    if (validationErrors.length > 0) {
      return res.status(400).json({
        message: "Validation error with the following fields",
        errors: validationErrors,
      });
    }

    // Fetch questions based on employee and lang
    const getStudents = await studentModel.find({ employee }).exec();

    // Flatten the data if it's nested
    const flatData = [].concat(...getStudents);

    // Send response
    res.status(200).json({
      data: flatData,
    });
  } catch (error) {
    console.error("Error getting questions:", error.message);
    res.status(500).json({
      message: "Failed to retrieve student details",
      error: error.message, // Include specific error details
    });
  }
};
