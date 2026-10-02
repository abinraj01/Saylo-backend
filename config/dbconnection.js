const mongoose = require("mongoose");
const dns = require("dns");
require("dotenv").config();

try {
  dns.setDefaultResultOrder("ipv4first");
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (e) {
  // Ignore DNS config errors if overridden by system
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/saylo_db");
    console.log(`✅ MongoDB connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error("❌ Unable to connect to MongoDB:", error);
    process.exit(1);
  }
};

module.exports = { connectDB, mongoose };
