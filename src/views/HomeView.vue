<template>
  <div class="home">
    <h1>Welcome, {{ username }}!</h1>
    <button @click="handleLogout">Logout</button>
  </div>
</template>

<script setup>
  import { defineProps, defineEmits, onMounted } from 'vue';
  import { supabase } from '../lib/supabaseClient';

  // Define props
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
    emit('logout'); // Emit the logout event
  };


</script>

<style>
.home {
  text-align: center;
}

button {
  padding: 10px 20px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #2c3e50;
}
</style>
