<template>
  <div class="app-background">
    <div class="portal-title">
      <h1>Unified Scholarship Portal</h1>
    </div>
    <div class="list-container">
      <!-- List 1 -->
      <ul class="list">
        <li>Scholarship 1A</li>
        <li>Scholarship 2A</li>
        <li>Scholarship 3A</li>
        <button class="applyBtn">Apply</button>
      </ul>
      <!-- List 2 -->
      <ul class="list">
        <li>Scholarship 1B</li>
        <li>Scholarship 2B</li>
        <li>Scholarship 3B</li>
        <button class="applyBtn">Apply</button>
      </ul>
      <!-- List 3 -->
      <ul class="list">
        <li>Scholarship 1C</li>
        <li>Scholarship 2C</li>
        <li>Scholarship 3C</li>
        <button class="applyBtn">Apply</button>
      </ul>
    </div>
  </div>
</template>

<script setup>
  // No script logic needed for static list display with apply buttons
</script>

<style>
/* Overall background styling */
.app-background {
  background-color: #000;
  color: #fff;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  align-items: center;
  justify-content: flex-start;
  padding: 20px;
}

/* Portal title styling */
.portal-title {
  margin-bottom: 30px;
  text-align: center;
  color: #ffffff;
  font-family: Helvetica, Arial, sans-serif;
  font-weight: bold;
  font-size: 24px;
}

/* List container styling */
.list-container {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  width: 100%;
  max-width: 1200px;
  padding: 20px;
  background-color: #1a1a1a;
  border-radius: 10px;
}

/* Each list styling */
.list {
  list-style-type: none;
  padding: 15px;
  background-color: #f8f8f8;
  border-radius: 8px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #333;
  font-family: Arial, sans-serif;
  font-size: 16px;
}

/* Apply button styling */
.applyBtn {
  width: 100%;
  max-width: 80px;
  padding: 10px;
  margin-top: 15px;
  background-color: #000; /* Black background */
  color: #fff; /* White text */
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.applyBtn:hover {
  background-color: #555; /* Darker color on hover */
}

/* Responsive adjustment for smaller screens */
@media screen and (max-width: 768px) {
  .list-container {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
