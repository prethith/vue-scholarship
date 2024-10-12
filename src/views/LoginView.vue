<template>
  <div class="login-container">
    <h1>Login: </h1>
    <input type="text" v-model="studentIDLogin" placeholder="Enter your student id"  class="inputUsername"/>
    <button @click="login" class="loginBtn">Login</button>
    <p v-if="invalidIDNotif">Invalid user ID!</p>
  </div>
</template>

<script setup>
  import { ref, onMounted, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import { defineEmits } from 'vue';
  import { supabase } from '../lib/supabaseClient';


  // Reactive username
  const studentIDLogin = ref('');
  const userIDs = ref([]);
  const invalidIDNotif = ref(false);
  // Router instance
  const router = useRouter();

  // Emit event for login success
  const emit = defineEmits(['login-success']);

  async function getStudentIDS() {
      // retrieve student_ID from students table
    const { data, error } = await supabase
    .from('Students')
    .select('student_id')
    .order('student_id');

    if (error) {
      console.error("Error fetching student IDs:", error);
      return; // Exit early if there's an error
    }

    userIDs.value = data.map(obj => obj.student_id);
    console.log(userIDs.value);
  }



  // Login function
  const login = () => {

    if (!studentIDLogin.value) {
      invalidIDNotif.value = true;  // Show error if input is empty
      return;
    }

    if (userIDs.value.includes(parseInt(studentIDLogin.value))) {

      invalidIDNotif.value = false;

      emit('login-success', studentIDLogin.value); // Emit the login success event
      console.log(studentIDLogin.value);
      localStorage.setItem('studentid', studentIDLogin.value);
      router.push({ name: 'Student' }); // Navigate to HomePage
    } else {
      invalidIDNotif.value = true;
    }
  };


  // Watch for changes on studentIDLogin to reset the invalid notification
  watch(studentIDLogin, () => {
    invalidIDNotif.value = false;  // Reset notification whenever the input changes
  });

  onMounted(() => {
    getStudentIDS();
  });
</script>

<style>
.login-container {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}
.loginBtn {
  width: 40%;
}
.inputUsername {
  padding: 10px;
  border: 0.5px solid #eaeaea;
  outline: none;
  border-radius: 25px;
}

.inputUsername:focus {
  border-color: transparent; /* Keep border transparent */
  outline: none; /* Remove default outline */
  box-shadow: 0 0 5px 2px rgba(66, 184, 131, 0.5); /* Green glow effect */

}
</style>
