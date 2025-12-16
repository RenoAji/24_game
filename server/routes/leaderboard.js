var express = require("express");
var router = express.Router();
const redisClient = require("../libs/redis_client"); // Redis client

router.get("/", async function (req, res, next) {
  try {
    // Get top 10 users from Redis sorted set
    const topUsers = await redisClient.zRangeWithScores("leaderboard", 0, 9, {
      REV: true,
    });

    res.json({
      status: "success",
      leaderboard: topUsers.map((user) => ({
        username: user.value,
        score: user.score,
      })),
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
});

module.exports = router;
