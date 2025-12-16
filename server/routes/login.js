var express = require("express");
var router = express.Router();
const bcrypt = require("bcrypt");

router.post("/", async function (req, res, next) {
  const { username, password } = req.body;

  const db = require("../libs/database");

  try {
    const database = await db();
    const user = await database.get(
      "SELECT * FROM users WHERE username = ?",
      username
    );

    if (user && bcrypt.compareSync(password, user.password)) {
      req.session.userId = user.id;
      req.session.username = user.username;
      res.json({ status: "success", message: "Logged in successfully." });
    } else {
      res
        .status(401)
        .json({ status: "fail", message: "Invalid credentials." });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
});

module.exports = router;
