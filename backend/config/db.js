const mongoose = require("mongoose");
const dns = require("dns");

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", true);

    // Bypasses local DNS resolver issues in environments where Node queries 127.0.0.1 by default
    const servers = dns.getServers();
    if (servers?.length === 1 && servers[0] === "127.0.0.1") {
      console.log("[MongoDB] Local DNS resolver loopback detected. Falling back to public DNS resolvers (1.1.1.1, 8.8.8.8) for SRV lookup.");
      dns.setServers(["1.1.1.1", "8.8.8.8"]);
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`[MongoDB] Connected: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on("error", (err) => {
      console.error(`[MongoDB] Connection error: ${err.message}`);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("[MongoDB] Disconnected. Attempting to reconnect is handled by the driver.");
    });

    return conn;
  } catch (error) {
    console.error(`[MongoDB] Initial connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
