require("dotenv").config()
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const User = require("../models/User")

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log("MongoDB connected for seeding")

    const existingAdmin = await User.findOne({ role: "admin" })
    if (existingAdmin) {
      console.log("Admin already exists:", existingAdmin.email)
      return process.exit(0)
    }
    const hashedPassword = await bcrypt.hash("admin123", 10)
    await User.create({
      name: "Admin",
      email: "admin@onejourney.com",
      phone: "9999999999",
      password: hashedPassword,
      role: "admin",
      isVerified :true,
    })

    console.log("Admin created successfully")
    console.log("Email: admin@onejourney.com")
    console.log("Password: admin123")
    process.exit(0)
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1)
  }
};

createAdmin()