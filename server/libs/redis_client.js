const redis = require("redis");

const client = redis.createClient({
  url: process.env.REDIS_URL,
});

client.on("error", (err) => console.error("Redis Client Error", err));

// Connect immediately
client.connect().then(() => {
  console.log("Connected to Redis Successfully");
});

module.exports = client;
