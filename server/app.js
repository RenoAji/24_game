// import necessary modules
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var session = require("express-session");
var http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

// route imports
var quizRouter = require("./routes/quiz");
var answerRouter = require("./routes/answer");
var registerRouter = require("./routes/register");
var loginRouter = require("./routes/login");
var leaderboardRouter = require("./routes/leaderboard");

var app = express();

const apiPrefix = process.env.API_PREFIX || "/";

app.use(
  session({
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    secret: "keyboard cat",
  })
);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors()); // Allow CORS for development
app.use((req, res, next) => {
  req.io = io;
  next();
});

// 1. Create the HTTP server using the Express app
const server = http.createServer(app);

// 2. Initialize Socket.IO on that server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Vue frontend port
    methods: ["GET", "POST"],
  },
});

app.use(`${apiPrefix}/quiz`, quizRouter);
app.use(`${apiPrefix}/answer`, answerRouter);
app.use(`${apiPrefix}/register`, registerRouter);
app.use(`${apiPrefix}/login`, loginRouter);
app.use(`${apiPrefix}/leaderboard`, leaderboardRouter);
io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("score_update", (data) => {
    console.log("leaderboard updated");
    console.log(data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    const redisClient = require("./libs/redis_client");
    // 1. Explicitly Connect to Redis
    // This ensures we are connected BEFORE we try to sync or listen
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log("✅ Redis Connected via app.js");
    }

    // 2. Sync Data
    // import redis client, database, and sync function
    const db = require("./libs/database");
    const database = await db();
    const syncLeaderboard = require("./libs/sync");
    await syncLeaderboard(database, redisClient);

    // 3. Start Server
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is listening on port ${PORT}`);
    });
  } catch (e) {
    console.error("Fatal Error:", e);
  }
}

startServer();

module.exports = app;
