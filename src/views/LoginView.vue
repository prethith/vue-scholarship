<template>
  <div class="app-background">
    <div class="portal-header">
      <h1> Unified Scholarship Portal. </h1>
    </div>
    <div class="login-container">
      <h1>Login.</h1>
      <input
        type="text"
        v-model="loginID"
        placeholder="Enter your user ID: "
        class="inputUsername"
      />
      <button @click="login" class="loginBtn">Login</button>
      <p v-if="invalidIDNotif">Invalid user ID!</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { defineEmits } from "vue";
import { supabase } from "../lib/supabaseClient";

// Reactive username
const loginID = ref("");
const userIDs = ref([]);
const invalidIDNotif = ref(false);
// Router instance
const router = useRouter();

// Emit event for login success
const emit = defineEmits(["login-success"]);

async function getStudentIDS() {
  // retrieve student_ID from students table
  const { data, error } = await supabase.from("Students").select("student_id").order("student_id");

  if (error) {
    console.error("Error fetching student IDs:", error);
    return; // Exit early if there's an error
  }

  userIDs.value = data.map((obj) => obj.student_id);
  console.log(userIDs.value);
}

// Login function
const login = () => {
  if (!loginID.value) {
    invalidIDNotif.value = true; // Show error if input is empty
    return;
  }

  if (userIDs.value.includes(parseInt(loginID.value))) {
    invalidIDNotif.value = false;
    emit("login-success", loginID.value); // Emit the login success event
    console.log(loginID.value);
    localStorage.setItem("studentid", loginID.value);
    router.push({ name: "Student" }); // Navigate to StudentView
  } else if (loginID.value === "admin") {
    emit("login-success", loginID.value); // Emit the login success event
    console.log(loginID.value);
    localStorage.setItem("admin", loginID.value);
    router.push({ name: "Admin" }); // Navigate to Admin view
  } else {
    invalidIDNotif.value = true;
  }
};

// Watch for changes on loginID to reset the invalid notification
watch(loginID, () => {
  invalidIDNotif.value = false; // Reset notification whenever the input changes
});

onMounted(() => {
  getStudentIDS();
});
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
  justify-content: center; /* Center content vertically */
}

/* Portal header styling */
.portal-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  color: #0d0d0d;
  padding: 20px;
  background-color: rgb(5, 5, 5);
 
  width: 100%;
  max-width: 800px;
  font-family: Helvetica;
}

.portal-header h1{
  color: #bbb00b;
  background-color: #000;
  font-weight: 800;
  font-size: 40px;
  margin-bottom: 10px;
  font-family: Helvetica;
}

/* Container for login */
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  color: #0d0d0d;
  padding: 20px;
  background-color: rgb(108, 109, 100);
  border-radius: 10px;
  width: 1500px;
  height: 500px;
  max-width: 2000px;
  margin: 0 auto;
  font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
}

/* Styling for the heading */
.login-container h1 {
  color: #080808;
  font-weight: 800;
  font-size: 48px;
  margin-bottom: 10px;
  font-family: Helvetica;
}

/* Styling for buttons */
.loginBtn {
  width: 100%;
  padding: 12px 20px;
  background-color: #0f0e0e;
  color: #fff;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-family: Helvetica;
  font-weight: bold;
  font-style: italic;
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.loginBtn:hover {
  background-color: #555652;
  box-shadow: 0 4px 10px rgba(230, 202, 222, 0.2);
}

/* Username input field */
.inputUsername {
  width: 100%;
  padding: 12px 20px;
  border: 1px solid #343433;
  border-radius: 25px;
  font-size: 16px;
  font-weight: lighter;
  outline: none;
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
  color: #121212;
}

/* Placeholder text styling */
.inputUsername::placeholder {
  color: #383838;
  font-weight: normal;
  font-size: 14px;
}

/* Focus effect for input */
.inputUsername:focus {
  border-color: transparent;
  box-shadow: 0 0 8px 3px rgba(63, 63, 60, 0.5);
}

/* Adjusting the width for better layout */
@media screen and (min-width: 768px) {
  .loginBtn {
    width: 40%;
  }

  .inputUsername {
    width: 80%;
  }
}
</style>
