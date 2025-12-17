var express = require("express");
var router = express.Router();
const redisClient = require("../libs/redis_client"); // Redis client

// Safe math expression evaluator
function evaluateExpression(expr) {
  // Remove whitespace
  expr = expr.replace(/\s+/g, "");

  // Only allow numbers, operators, and parentheses
  if (!/^[\d+\-*/(). ]+$/.test(expr)) {
    throw new Error("Invalid characters in expression");
  }

  // Use Function constructor (safer than eval, but still validate input)
  try {
    const result = new Function(`'use strict'; return (${expr})`)();
    return result;
  } catch (error) {
    throw new Error("Invalid mathematical expression");
  }
}

/* POST answer submission. */
router.post("/", async function (req, res, next) {
  console.log(req.body);
  const answer = req.body.answer;

  // Basic validation
  if (!answer || typeof answer !== "string") {
    return res.status(400).json({
      status: "fail",
      message: "Invalid answer format.",
    });
  }

  const numbers = answer.match(/\d+/g);

  if (!numbers || numbers.length !== 4) {
    return res.status(400).json({
      status: "fail",
      message: "Answer must use exactly 4 numbers.",
    });
  }

  if (!req.session.numbers) {
    return res.status(400).json({
      status: "fail",
      message: "No active quiz session.",
    });
  }

  // Convert extracted numbers to integers
  const numbersArray = numbers.map(Number);

  // Check if the numbers used in the answer match the session numbers
  const sessionNumbers = [...req.session.numbers];

  for (const num of numbersArray) {
    const index = sessionNumbers.indexOf(num);
    if (index === -1) {
      return res.status(400).json({
        status: "fail",
        message: "Used number not in quiz.",
      });
    }
    sessionNumbers.splice(index, 1);
  }

  // Safely evaluate the expression
  let result;
  let isCorrect = false;
  try {
    result = evaluateExpression(answer);
    isCorrect = Math.abs(result - 24) < 0.0001; // Account for floating point errors
  } catch (error) {
    return res.status(400).json({
      status: "fail",
      message: "Invalid mathematical expression: " + error.message,
    });
  }

  console.log("Evaluated result:", result, "Is correct:", isCorrect);
  console.log("Session username:", req.session.username);
  if (isCorrect && req.session.username) {
    console.log("Updating score for", req.session.username);
    const username = req.session.username;

    // Increment score in Redis sorted set
    const newRedisScore = await redisClient.zIncrBy("leaderboard", 1, username);
    console.log("New Redis score:", newRedisScore);
    const top10 = await redisClient.zRangeWithScores("leaderboard", 0, 9, {
      REV: true,
    });

    const db = require("../libs/database");
    const database = await db();

    // Force SQL to match Redis
    await database.run(
      "UPDATE users SET score = ? WHERE username = ?",
      newRedisScore,
      username
    );

    // Emit updated leaderboard to all connected clients
    const data = top10.map((user) => ({
      rank: top10.indexOf(user) + 1,
      username: user.value,
      score: user.score,
    }));
    req.io.emit("score_update", data);
  }

  res.json({
    status: "success",
    is_correct: isCorrect,
    result: result,
  });
});

module.exports = router;
