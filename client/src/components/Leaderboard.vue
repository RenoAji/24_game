<template>
  <div class="leaderboard-container">
    <h2>🏆 Leaderboard</h2>
    <div v-if="loading" class="loading-text">Loading leaderboard...</div>
    <div v-else-if="leaderboard.length === 0" class="loading-text">
      No data available
    </div>
    <div v-else class="leaderboard-table">
      <div class="leaderboard-header">
        <span class="rank-col">Rank</span>
        <span class="name-col">Player</span>
        <span class="score-col">Score</span>
      </div>
      <div
        v-for="entry in leaderboard"
        :key="entry.rank"
        class="leaderboard-row"
        :class="{ 'top-three': entry.rank <= 3 }"
      >
        <span class="rank-col">
          <span v-if="entry.rank === 1" class="medal">🥇</span>
          <span v-else-if="entry.rank === 2" class="medal">🥈</span>
          <span v-else-if="entry.rank === 3" class="medal">🥉</span>
          <span v-else>{{ entry.rank }}</span>
        </span>
        <span class="name-col">{{ entry.username }}</span>
        <span class="score-col">{{ entry.score }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  leaderboard: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
.leaderboard-container {
  padding: 2rem;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
}

h2 {
  color: #2c3e50;
  margin-top: 0;
  margin-bottom: 1.5rem;
}

.loading-text {
  text-align: center;
  color: #888;
  padding: 2rem;
  font-style: italic;
}

.leaderboard-table {
  margin-top: 1rem;
}

.leaderboard-header,
.leaderboard-row {
  display: grid;
  grid-template-columns: 60px 1fr 80px;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  align-items: center;
}

.leaderboard-header {
  background-color: #34495e;
  color: white;
  font-weight: 600;
  border-radius: 6px 6px 0 0;
  font-size: 0.9rem;
}

.leaderboard-row {
  border-bottom: 1px solid #e9ecef;
  transition: background-color 0.2s;
}

.leaderboard-row:hover {
  background-color: #f8f9fa;
}

.leaderboard-row:last-child {
  border-bottom: none;
  border-radius: 0 0 6px 6px;
}

.leaderboard-row.top-three {
  background-color: #fff9e6;
  font-weight: 600;
}

.leaderboard-row.top-three:hover {
  background-color: #fff3cd;
}

.rank-col {
  text-align: center;
  font-weight: 600;
}

.name-col {
  text-align: left;
}

.score-col {
  text-align: center;
  font-weight: 600;
  color: #42b883;
}

.medal {
  font-size: 1.5rem;
  display: inline-block;
}

@media (max-width: 500px) {
  .leaderboard-container {
    padding: 1.5rem;
  }

  .leaderboard-header,
  .leaderboard-row {
    grid-template-columns: 50px 1fr 70px;
    padding: 0.6rem 0.75rem;
    font-size: 0.85rem;
  }
}
</style>
