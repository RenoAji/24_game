async function syncLeaderboard(db, redisClient) {
  try {
    // 1. Check if Redis already has data
    const count = await redisClient.zCard("leaderboard");

    // Optional: If you want to force-sync every restart, remove the 'if' check
    // if (count > 0) {
    //   console.log("✅ Redis leaderboard is already populated.");
    //   return;
    // }

    console.log("⚠️ Redis is empty. Hydrating from SQLite...");

    // 2. Get ALL users from SQLite (or just top 100 if you have millions)
    // We need 'username' and 'score'
    const users = await db.all(
      "SELECT username, score FROM users WHERE score > 0 ORDER BY score DESC LIMIT 10"
    );

    if (users.length === 0) {
      console.log("ℹ️ No users found in SQLite to sync.");
      return;
    }

    // 3. Prepare the batch for Redis
    const leaderboardData = users.map((user) => ({
      score: user.score,
      value: user.username,
    }));

    // 4. Insert into Redis Sorted Set
    await redisClient.zAdd("leaderboard", leaderboardData);

    console.log(
      `✅ Successfully synced ${users.length} users to Redis leaderboard.`
    );
  } catch (error) {
    console.error("❌ Failed to sync leaderboard:", error);
  }
}
module.exports = syncLeaderboard;
