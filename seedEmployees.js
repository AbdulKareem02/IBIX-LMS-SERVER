const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Employee = require("./src/models/employees");
require("dotenv").config();

async function seedEmployees() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB!");

    const employees = [
      {
        email: "",
        password: "",
        name: "",
        designation: "",
      },

      // add more employees here
    ];

    for (let emp of employees) {
      const hashedPassword = await bcrypt.hash(emp.password, 10);
      await Employee.updateOne(
        { email: emp.email },
        {
          $set: {
            password: hashedPassword,
            name: emp.name,
            designation: emp.designation,
          },
        },
        { upsert: true }
      );
    }

    console.log("Employees added/updated successfully!");
    await mongoose.disconnect();
  } catch (err) {
    console.error("Error seeding employees:", err);
  }
}

seedEmployees();
