<script setup>
  import { defineProps, defineEmits, onMounted, ref } from 'vue';
  import { supabase } from '../lib/supabaseClient';
  import { runAssignmentProcess } from '../utils/scholarshipManager';

  const isProcessing = ref(false);
  const message = ref('');

  // trigger a round of assignment
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
    <h1>Welcome, {{ username }}</h1>
    <button @click="handleLogout" class="logoutBtn" role="button">Logout</button>
    <button @click="triggerAssignmentProcess" :disabled="isProcessing" class="choiceBtn">
      {{ isProcessing ? 'Processing...' : 'Run Assignment Process' }}
    </button>
    <p>{{ message }}</p>
  </div>
  
</template>


<style>
  .home {
    text-align: center;
  }
</style>