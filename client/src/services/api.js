// API service for 24 Game backend communication
const API_BASE = import.meta.env.VITE_API_BASE || "/api";

/**
 * Fetch a new quiz from the backend
 * @returns {Promise<{numbers: number[]}>}
 */
export async function fetchQuiz() {
  const res = await fetch(`${API_BASE}/quiz`, { credentials: "include" });
  if (!res.ok) {
    throw new Error(`Server returned ${res.status}`);
  }
  const data = await res.json();

  // Handle different response formats
  let quiz = null;
  if (Array.isArray(data)) {
    quiz = data[0];
  } else if (data && data.numbers) {
    quiz = data;
  } else if (data && data.items && data.items.length > 0) {
    quiz = data.items[0];
  }

  if (!quiz || !quiz.numbers) {
    throw new Error("Invalid quiz data from server");
  }

  return quiz;
}

/**
 * Submit answer to the backend for validation
 * @param {string} answer - The user's formula
 * @returns {Promise<{is_correct: boolean, message?: string}>}
 */
export async function submitAnswer(answer) {
  const res = await fetch(`${API_BASE}/answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answer }),
    credentials: "include",
  });

  if (!res.ok) {
    let errText = `Server returned ${res.status}`;
    try {
      const j = await res.json();
      if (j && j.message) errText = j.message;
    } catch (e) {}
    throw new Error(errText);
  }

  return await res.json();
}

/**
 * Fetch leaderboard data from backend
 * @returns {Promise<Array<{rank: number, username: string, score: number, solvedCount: number}>>}
 */
export async function fetchLeaderboard() {
  const res = await fetch(`${API_BASE}/leaderboard`, {
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(`Server returned ${res.status}`);
  }
  return await res.json();
}

/**
 * Login user
 * @param {string} username
 * @param {string} password
 * @returns {Promise<void>}
 */
export async function login(username, password) {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
    credentials: "include",
  });

  if (!res.ok) {
    let msg = `Server returned ${res.status}`;
    try {
      const j = await res.json();
      if (j && j.message) msg = j.message;
    } catch (e) {}
    throw new Error(msg);
  }

  return await res.json();
}

/**
 * Register new user
 * @param {string} username
 * @param {string} password
 * @returns {Promise<void>}
 */
export async function register(username, password) {
  const res = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
    credentials: "include",
  });

  if (!res.ok) {
    let msg = `Server returned ${res.status}`;
    try {
      const j = await res.json();
      if (j && j.message) msg = j.message;
    } catch (e) {}
    throw new Error(msg);
  }

  return await res.json();
}

/**
 * Logout current user
 * @returns {Promise<void>}
 */
export async function logout() {
  await fetch(`${API_BASE}/logout`, {
    method: "POST",
    credentials: "include",
  });
}

/**
 * Get current user info
 * @returns {Promise<{username: string}>}
 */
export async function getCurrentUser() {
  const res = await fetch(`${API_BASE}/user`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(`Server returned ${res.status}`);
  }

  return await res.json();
}
