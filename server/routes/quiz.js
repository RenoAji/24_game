var express = require("express");
var router = express.Router();

/* GET quiz numbers. */
router.get("/", function (req, res, next) {
  // const quizId = generateId();
  const numbers = [];
  for (let i = 0; i < 4; i++) {
    numbers.push(Math.floor(Math.random() * 9) + 1);
  }

  req.session.numbers = numbers;

  res.json({ numbers: numbers });
});

module.exports = router;
