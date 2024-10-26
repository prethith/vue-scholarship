<script setup>
import { defineProps, defineEmits, onMounted, ref } from 'vue';
import { supabase } from '../lib/supabaseClient';
import { runAssignmentProcess } from '../utils/scholarshipManager';

const isProcessing = ref(false);
const message = ref('');

// Trigger a round of assignment
async function triggerAssignmentProcess() {
  isProcessing.value = true;
  message.value = 'Assignment process started...';
  try {
    await runAssignmentProcess();
    message.value = 'Assignment process completed successfully.';
  } catch (error) {
    console.error('Error in assignment process:', error);
    message.value = 'Error occurred during assignment process.';
  } finally {
    isProcessing.value = false;
  }
}

const props = defineProps({
  username: {
    type: String,
    required: true,
  },
});

// Define emits
const emit = defineEmits(['logout']);
// Handle the logout functionality
const handleLogout = () => {
  localStorage.removeItem('admin');
  emit('logout'); // Emit the logout event
};
</script>

<template>
  <div class="admin_dashboard">
    <div class="header">
      <h2>Unified Scholarship Portal.</h2>
    </div>
    
    <div class="welcome-section">
      <h1>Welcome, {{ username }}!</h1>
    </div>
    
    <button @click="triggerAssignmentProcess" :disabled="isProcessing" class="choiceBtn">
      {{ isProcessing ? 'Processing...' : 'Run Assignment Process' }}
    </button>
    <p>{{ message }}</p>

    <button @click="handleLogout" class="logoutBtn" role="button">Logout</button>
  </div>
</template>

<style>
.admin_dashboard {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

h1 {
  color: #0e0e0e;
  font-weight: 800;
  font-size: 40px;
  font-family: Helvetica;
  font-style: italic;
}

h2 {
  color: #bbb00b;
  font-weight: 800;
  font-size: 40px;
  margin-bottom: 10px;
  font-family: Helvetica;
  background-color: #080808;
  font-style: italic;
}

.header {
  padding-top: 10px;
  font-size: 1.5em;
  color: #333;
}

.welcome-section h1 {
  margin-top: 20px;
  font-size: 2em;
  font-weight: bold;
}

.choiceBtn {
  margin-top: 20px;
  padding: 10px 20px;
  font-size: 1em;
}

.choiceBtn:hover {
  background-color: #4d4c4b; /* Darker shade for hover effect */
}

.logoutBtn {
  margin-top: 40px;
  padding: 10px 20px;
  font-size: 1em;
  color: #fff;
  background-color: #902507;
  border: none;
  cursor: pointer;
}

.logoutBtn:hover {
  background-color: #754d40; /* Darker red on hover */
}

.logoutBtn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style> add a black padding under unified scholarship portal 