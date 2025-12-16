<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>{{ mode === "login" ? "Login" : "Register" }}</h2>
      <div class="auth-row">
        <label>Username</label>
        <input
          v-model="form.username"
          type="text"
          @keyup.enter="handleSubmit"
        />
      </div>
      <div class="auth-row">
        <label>Password</label>
        <input
          v-model="form.password"
          type="password"
          @keyup.enter="handleSubmit"
        />
      </div>
      <div class="auth-actions">
        <button @click="handleSubmit" :disabled="loading">
          {{ loading ? "Working..." : mode === "login" ? "Login" : "Register" }}
        </button>
        <button @click="toggleMode" :disabled="loading">
          {{ mode === "login" ? "Switch to Register" : "Switch to Login" }}
        </button>
      </div>
      <p v-if="error" class="auth-error">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  mode: {
    type: String,
    default: "login",
    validator: (val) => ["login", "register"].includes(val),
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["submit", "toggle-mode"]);

const form = ref({
  username: "",
  password: "",
});

function handleSubmit() {
  if (!form.value.username || !form.value.password) {
    return;
  }
  emit("submit", { ...form.value });
}

function toggleMode() {
  emit("toggle-mode");
  form.value = { username: "", password: "" };
}
</script>

<style scoped>
.auth-container {
  display: grid;
  place-items: center;
  min-height: 40vh;
}

.auth-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  width: 320px;
}

.auth-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
}

.auth-row input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.auth-row input:focus {
  border-color: #42b883;
  outline: none;
}

.auth-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.auth-actions button {
  flex: 1;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  border: 2px solid #42b883;
  border-radius: 6px;
  cursor: pointer;
  background-color: #42b883;
  color: white;
  transition: all 0.2s;
}

.auth-actions button:last-child {
  background-color: white;
  color: #42b883;
}

.auth-actions button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.auth-actions button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.auth-error {
  color: #c0392b;
  margin-top: 0.5rem;
  font-weight: 600;
  text-align: center;
}

h2 {
  color: #2c3e50;
  margin-top: 0;
  margin-bottom: 1.5rem;
  text-align: center;
}
</style>
