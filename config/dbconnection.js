const mongoose = require("mongoose");
const dns = require("dns");
require("dotenv").config();

try {
  dns.setDefaultResultOrder("ipv4first");
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (e) {
  // Ignore DNS config errors if overridden by system
}

function extractHost(mongoUri) {
  try {
    const withoutScheme = mongoUri.replace(/^mongodb(?:\+srv)?:\/\//, "");
    const withoutCreds = withoutScheme.includes("@")
      ? withoutScheme.split("@")[1]
      : withoutScheme;
    return withoutCreds.split(/[/?]/)[0] || "unknown host";
  } catch {
    return "unknown host";
  }
}

function sanitizeErrorMessage(error) {
  const msg = error && error.message ? error.message : String(error);
  return msg.replace(/\/\/[^:]+:[^@]+@/g, "//***:***@");
}

const connectDB = async (retries = 3, delayMs = 2000) => {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/saylo_db";
  const host = extractHost(uri);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`📡 [Attempt ${attempt}/${retries}] Connecting to MongoDB host: ${host}`);
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`✅ MongoDB connected successfully to host: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      const cleanError = sanitizeErrorMessage(error);
      console.error(`❌ [Attempt ${attempt}/${retries}] Failed to connect to MongoDB host (${host}): ${cleanError}`);
      if (attempt < retries) {
        console.log(`⏳ Retrying connection in ${delayMs / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      } else {
        console.error(`💥 All ${retries} connection attempts failed. Exiting...`);
        process.exit(1);
      }
    }
  }
};

module.exports = { connectDB, mongoose, extractHost };

