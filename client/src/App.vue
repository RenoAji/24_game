<script setup>
import { ref, onMounted } from "vue";
import { useAuth } from "./composables/useAuth";
import { useSocket } from "./composables/useSocket";
import * as api from "./services/api";
import AuthForm from "./components/AuthForm.vue";
import GameBoard from "./components/GameBoard.vue";
import Leaderboard from "./components/Leaderboard.vue";

// --- Composables ---
const {
  isAuthenticated,
  authLoading,
  authError,
  username,
  loginUser,
  registerUser,
  logoutUser,
  tryRestoreSession,
} = useAuth();
const { connect: connectSocket, on: onSocketEvent } = useSocket();

// --- State ---
const numbers = ref([]);
const message = ref("");
const loading = ref(false);
const leaderboard = ref([]);
const solvedCorrect = ref(false);
const authMode = ref("login");
const leaderboardLoading = ref(false);

// --- Game Logic ---
/**
 * Fetch a new quiz and reset game state
 */
async function newGame() {
  loading.value = true;
  message.value = "";
  solvedCorrect.value = false;

  try {
    const quiz = await api.fetchQuiz();
    numbers.value = quiz.numbers;
    message.value = "Make 24 using these numbers!";
  } catch (err) {
    console.error(err);
    message.value = `Error loading quiz: ${err.message}`;
    numbers.value = [];
  } finally {
    loading.value = false;
  }
}

/**
 * Fetch leaderboard data from backend
 */
async function fetchLeaderboard() {
  console.log("Fetching leaderboard...");
  leaderboardLoading.value = true;
  try {
    const data = await api.fetchLeaderboard();
    console.log("Leaderboard data:", data);
    // Extract leaderboard array from response object
    if (data.leaderboard && Array.isArray(data.leaderboard)) {
      leaderboard.value = data.leaderboard.map((entry, index) => ({
        rank: index + 1,
        username: entry.username,
        score: entry.score,
      }));
    } else if (Array.isArray(data)) {
      leaderboard.value = data.map((entry, index) => ({
        rank: index + 1,
        username: entry.username,
        score: entry.score,
      }));
    } else {
      leaderboard.value = [];
    }
  } catch (err) {
    console.error("Failed to fetch leaderboard:", err);
    // Mock data for development
    leaderboard.value = [
      { rank: 1, username: "Player1", score: 150 },
      { rank: 2, username: "Player2", score: 120 },
      { rank: 3, username: "Player3", score: 95 },
    ];
  } finally {
    leaderboardLoading.value = false;
  }
}

/**
 * Perform login or register based on `authMode` and update session
 */
async function submitAuth({ username, password }) {
  try {
    if (authMode.value === "login") {
      await loginUser(username, password);
    } else {
      await registerUser(username, password);
    }

    // Initialize socket connection after successful authentication
    connectSocket();
    onSocketEvent("score_update", (data) => {
      console.log(data);
      leaderboard.value = data;
    });

    // load game and leaderboard
    await newGame();
    fetchLeaderboard();
  } catch (err) {
    // Error already handled in useAuth composable
  }
}

/**
 * Toggle between login and register modes
 */
function toggleAuthMode() {
  authMode.value = authMode.value === "login" ? "register" : "login";
}

/**
 * Logout user and clear session
 */
async function logout() {
  await logoutUser();
  // clear local game state
  numbers.value = [];
  message.value = "";
  leaderboard.value = [];
  solvedCorrect.value = false;
}

// --- Core Game Logic (networked) ---
/**
 * Submit the user's formula to the backend for validation
 */
async function checkSolution(answer) {
  if (!answer || answer.trim() === "") {
    message.value = "Please enter a formula before checking.";
    return;
  }
  if (!numbers.value || numbers.value.length !== 4) {
    message.value = "No active quiz. Click New Game to load one.";
    return;
  }

  loading.value = true;
  message.value = "Checking...";

  try {
    const payload = await api.submitAnswer(answer);

    // Backend minimal response: { is_correct: boolean }
    if (payload && typeof payload.is_correct === "boolean") {
      if (payload.is_correct) {
        solvedCorrect.value = true;
        message.value = payload.message || `🎉 Correct! ${answer} = 24.`;
      } else {
        message.value = payload.message || `No — ${answer} is not 24.`;
      }
    } else if (payload && payload.status === false) {
      // fallback to older schema
      message.value = payload.message || "Server failed to process request.";
    } else {
      message.value = payload.message || "Unexpected response from server.";
    }
  } catch (err) {
    console.error(err);
    message.value = `Error checking answer: ${err.message}`;
  } finally {
    loading.value = false;
  }
}

// --- Lifecycle ---
onMounted(async () => {
  const restored = await tryRestoreSession();
  if (restored) {
    // Session exists, load game and leaderboard
    await newGame();
    fetchLeaderboard();
  }
  connectSocket();
  onSocketEvent("score_update", (data) => {
    console.log(data);
    leaderboard.value = data;
  });
});
</script>

<template>
  <div class="app-wrapper">
    <h1 class="main-title">🔢 24 Game</h1>

    <!-- Auth view when not authenticated -->
    <AuthForm
      v-if="!isAuthenticated"
      :mode="authMode"
      :loading="authLoading"
      :error="authError"
      @submit="submitAuth"
      @toggle-mode="toggleAuthMode"
    />

    <!-- Game and Leaderboard view when authenticated -->
    <div v-else class="content-grid">
      <GameBoard
        :numbers="numbers"
        :loading="loading"
        :solved="solvedCorrect"
        :message="message"
        :username="username"
        @check-solution="checkSolution"
        @new-game="newGame"
        @logout="logout"
      />

      <Leaderboard :leaderboard="leaderboard" :loading="leaderboardLoading" />
    </div>
  </div>
</template>

<style>
/* Basic styling to make it look nice */
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  background-color: #f4f7f6;
  color: #333;
  margin: 0;
  padding: 1rem;
}

.app-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.main-title {
  color: #2c3e50;
  text-align: center;
  margin: 0 0 2rem 0;
  font-size: 2.5rem;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: start;
}

/* Responsive adjustments */
@media (max-width: 900px) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .main-title {
    font-size: 2rem;
  }
}

@media (max-width: 500px) {
  .app-wrapper {
    padding: 0.5rem;
  }

  .main-title {
    font-size: 1.75rem;
    margin-bottom: 1.5rem;
  }
}
</style>
