<template>
  <div id="app">
    <router-view @logout="handleLogout" @login-success="handleLoginSuccess" :username="username" />
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { supabase } from './lib/supabaseClient'

  // Define reactive state for username
  const username = ref('');

  // Router instance
  const router = useRouter();

  // Handle login success
  const handleLoginSuccess = (user) => {
    username.value = user; // Store the username
    router.push({ name: 'Student' }); // Navigate to the HomeView
  };

  // Handle logout
  const handleLogout = () => {
    username.value = ''; // Clear the username
    router.push({ name: 'Login' }); // Navigate back to the LoginView
  };
</script>

<style>
/* Add styles for the app */
#welcome {
  text-align: center;
}
</style>
