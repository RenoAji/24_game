<template>
  <div class="game-container">
    <div class="game-header">
      <span v-if="username" class="username-display">👤 {{ username }}</span>
      <button @click="$emit('logout')" class="logout-btn">Logout</button>
    </div>

    <div class="numbers-display">
      <button
        v-for="(num, index) in numbers"
        :key="index"
        class="number-card clickable"
        :disabled="loading || solved"
        @click="appendToInput(num.toString())"
      >
        {{ num }}
      </button>
    </div>

    <p class="instructions">
      Click the numbers and operators below to build your formula, or type
      directly.
    </p>

    <div class="input-area">
      <input
        v-model="userInput"
        @keyup.enter="handleCheck"
        @keydown="validateInput"
        :disabled="solved || loading"
        type="text"
        placeholder="Click numbers & operators or type here"
        class="formula-input"
      />
    </div>

    <div class="button-grid">
      <button
        @click="appendToInput('(')"
        class="operator-btn"
        :disabled="loading || solved"
      >
        (
      </button>
      <button
        @click="appendToInput(')')"
        class="operator-btn"
        :disabled="loading || solved"
      >
        )
      </button>
      <button
        @click="appendToInput('+')"
        class="operator-btn"
        :disabled="loading || solved"
      >
        +
      </button>
      <button
        @click="appendToInput('-')"
        class="operator-btn"
        :disabled="loading || solved"
      >
        −
      </button>
      <button
        @click="appendToInput('*')"
        class="operator-btn"
        :disabled="loading || solved"
      >
        ×
      </button>
      <button
        @click="appendToInput('/')"
        class="operator-btn"
        :disabled="loading || solved"
      >
        ÷
      </button>
      <button
        @click="backspace"
        class="control-btn"
        :disabled="loading || solved"
      >
        ⌫
      </button>
      <button
        @click="clearInput"
        class="control-btn"
        :disabled="loading || solved"
      >
        Clear
      </button>
    </div>

    <div class="action-buttons">
      <button
        @click="handleCheck"
        class="check-btn"
        :disabled="loading || solved"
      >
        {{ loading ? "Checking..." : solved ? "Solved" : "Check Answer" }}
      </button>
      <button @click="$emit('new-game')" class="new-game" :disabled="loading">
        New Game
      </button>
    </div>

    <p
      v-if="message"
      class="message"
      :class="{ 'is-error': message.startsWith('Error') }"
    >
      {{ message }}
    </p>

    <div class="rules">
      <h3>Rules:</h3>
      <ul>
        <li>Use all four numbers exactly once.</li>
        <li>Use operators: <b>+</b>, <b>−</b>, <b>×</b>, <b>÷</b></li>
        <li>Use parentheses <b>( )</b> for order of operations.</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  numbers: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  solved: {
    type: Boolean,
    default: false,
  },
  message: {
    type: String,
    default: "",
  },
  username: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["check-solution", "new-game", "logout"]);

const userInput = ref("");

// Reset input when numbers change (new game)
watch(
  () => props.numbers,
  () => {
    userInput.value = "";
  }
);

// Reset input when solved state changes to false
watch(
  () => props.solved,
  (newVal) => {
    if (!newVal) {
      userInput.value = "";
    }
  }
);

function appendToInput(value) {
  if (props.solved || props.loading) return;
  userInput.value += value;
}

function clearInput() {
  if (props.solved || props.loading) return;
  userInput.value = "";
}

function backspace() {
  if (props.solved || props.loading) return;
  userInput.value = userInput.value.slice(0, -1);
}

function validateInput(event) {
  const allowedChars = /[0-9+\-*/().\s]/;
  if (props.solved) {
    if (event.key.length === 1) event.preventDefault();
    return;
  }
  if (!allowedChars.test(event.key) && event.key.length === 1) {
    event.preventDefault();
  }
}

function handleCheck() {
  if (!userInput.value || userInput.value.trim() === "") {
    return;
  }
  emit("check-solution", userInput.value);
}
</script>

<style scoped>
.game-container {
  padding: 2rem;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.username-display {
  font-weight: 600;
  color: #2c3e50;
  font-size: 1rem;
}

.logout-btn {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  border: 2px solid #e74c3c;
  border-radius: 6px;
  cursor: pointer;
  background-color: white;
  color: #e74c3c;
  transition: all 0.2s;
}

.logout-btn:hover {
  background-color: #e74c3c;
  color: white;
  transform: translateY(-1px);
}

.numbers-display {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin: 1.5rem 0;
}

.number-card {
  display: inline-block;
  font-size: 2.5rem;
  font-weight: bold;
  padding: 1rem 1.5rem;
  background-color: #42b883;
  color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: none;
  cursor: default;
}

.number-card.clickable {
  cursor: pointer;
  transition: all 0.2s;
}

.number-card.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  background-color: #35a372;
}

.number-card.clickable:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.number-card:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  background-color: #7fb89a;
}

.instructions {
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 1rem;
}

.input-area {
  margin: 1.5rem 0;
}

.formula-input {
  width: 100%;
  padding: 0.75rem;
  font-size: 1.1rem;
  border: 2px solid #ddd;
  border-radius: 6px;
  transition: border-color 0.2s;
  box-sizing: border-box;
  font-family: "Courier New", monospace;
}

.formula-input:focus {
  border-color: #42b883;
  outline: none;
}

.button-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  margin: 1.5rem 0;
}

.operator-btn,
.control-btn {
  padding: 0.75rem;
  font-size: 1.2rem;
  font-weight: 600;
  border: 2px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  background-color: #f8f9fa;
  color: #333;
  transition: all 0.2s;
}

.operator-btn:hover,
.control-btn:hover {
  background-color: #e9ecef;
  border-color: #adb5bd;
  transform: translateY(-1px);
}

.operator-btn:active,
.control-btn:active {
  transform: translateY(0);
}

.operator-btn:disabled,
.control-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  background-color: #f0f0f0;
}

.control-btn {
  background-color: #fff3cd;
  border-color: #ffc107;
}

.control-btn:hover {
  background-color: #ffe69c;
  border-color: #ffb300;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  margin: 1.5rem 0;
}

.check-btn,
.new-game {
  flex: 1;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: white;
  transition: all 0.2s;
}

.check-btn {
  background-color: #34495e;
}

.check-btn:hover:not(:disabled) {
  background-color: #4a6583;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.check-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.new-game {
  background-color: #e67e22;
}

.new-game:hover:not(:disabled) {
  background-color: #d35400;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.new-game:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.message {
  font-weight: 600;
  padding: 0.75rem;
  border-radius: 6px;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message:not(.is-error) {
  background-color: #e0f8eb;
  color: #2a9d8f;
}

.message.is-error {
  background-color: #fbebee;
  color: #c0392b;
}

.rules {
  text-align: left;
  font-size: 0.9rem;
  color: #555;
  background-color: #fafafa;
  padding: 0.5rem 1.5rem;
  border-radius: 6px;
  margin-top: 2rem;
}

.rules h3 {
  margin: 0.5rem 0;
}

.rules ul {
  padding-left: 20px;
  margin: 0.5rem 0;
}

@media (max-width: 500px) {
  .game-container {
    padding: 1.5rem;
  }

  .number-card {
    font-size: 2rem;
    padding: 0.75rem 1rem;
  }

  .button-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 0.4rem;
  }

  .operator-btn,
  .control-btn {
    padding: 0.6rem;
    font-size: 1rem;
  }
}
</style>
