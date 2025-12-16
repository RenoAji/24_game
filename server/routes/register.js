var express = require("express");
var router = express.Router();
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");

router.post(
  "/",
  [
    body("username")
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage("Username must be between 3 and 30 characters")
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage("Username can only contain letters, numbers, and underscores"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  async function (req, res, next) {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "fail",
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { username, password } = req.body;

    try {
      const db = require("../libs/database");
      const database = await db();

      // Check if user already exists
      const existingUser = await database.get(
        "SELECT * FROM users WHERE username = ?",
        username
      );

      if (existingUser) {
        return res.status(409).json({
          status: "fail",
          message: "Username already exists",
        });
      }

      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Insert new user
      const result = await database.run(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        username,
        hashedPassword
      );

      res.status(201).json({
        status: "success",
        message: "User registered successfully",
        userId: result.lastID,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  }
);

module.exports = router;
