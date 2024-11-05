<script setup>
import { defineProps, onMounted, ref, watch } from 'vue';
import { supabase } from '../lib/supabaseClient';
import { assignScholarships, getEligibleScholarships, getStudents, getScholarships, getAssignedScholarships, applyForScholarship, getAcceptedScholarships } from '../utils/scholarshipManager';

// Reactive references to store data
const studentData = ref({});
const eligibleScholarships = ref([]);
const assignedScholarships = ref([]);
const acceptedScholarships = ref([]);
const applicationMessage = ref('');
const userID = localStorage.getItem('studentid');

// Define props
const props = defineProps({
  username: {
    type: String,
    required: true,
  },
});

// Fetch student data based on userID
async function getStudentData() {
  const { data, error } = await supabase
    .from('Students')
    .select()
    .eq('student_id', userID)
    .single();

  if (error) {
    console.error("Error fetching student data:", error.message);
  } else {
    studentData.value = data;
  }
}

// Apply for scholarship
async function handleApplyScholarship(scholarship_id) {
  const result = await applyForScholarship(userID, scholarship_id);
  applicationMessage.value = result.message;
}

// Accept scholarship
async function acceptScholarship(scholarship_id) {
  const { data, error } = await supabase
    .from("AssignedScholarships")
    .select("status")
    .eq("student_id", userID)
    .eq("scholarship_id", scholarship_id);

  if (!error && data[0]?.status === "pending") {
    const { error: rpcError } = await supabase.rpc("acceptscholarship", {
      p_student_id: userID,
      p_scholarship_id: scholarship_id,
    });

    if (!rpcError) {
      alert("Scholarship accepted successfully!");
      // Refresh accepted scholarships list
      acceptedScholarships.value = await getAcceptedScholarships(userID);
    }
  }
}

// Reject scholarship
async function rejectScholarship(scholarship_id) {
  const { data, error } = await supabase
    .from("AssignedScholarships")
    .select("status")
    .eq("student_id", userID)
    .eq("scholarship_id", scholarship_id);

  if (!error && data[0]?.status === "pending") {
    await supabase
      .from("AssignedScholarships")
      .update({ status: "rejected" })
      .eq("student_id", userID)
      .eq("scholarship_id", scholarship_id);

    // Update scholarship capacity
    await supabase.rpc("increaseCapacity", { sch_id: scholarship_id });
  }
}

// Fetch data on component mount
onMounted(async () => {
  await getStudentData();
  eligibleScholarships.value = await getEligibleScholarships(studentData.value, await getScholarships());
  assignedScholarships.value = await getAssignedScholarships(userID);
  acceptedScholarships.value = await getAcceptedScholarships(userID);
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
  <div class="student-view">
    <div class="header">
      <h2>Unified Scholarship Portal</h2>
    </div>
    <h1>Welcome, {{ studentData.name }}!</h1>

    <section class="student-details">
      <h3>Student Details</h3>
      <p><strong>Rank:</strong> {{ studentData.rank }}</p>
      <p><strong>Income:</strong> ₹{{ studentData.income }}</p>
      <p><strong>Category:</strong> {{ studentData.category_ID }}</p>
    </section>

    <section class="scholarships">
      <!-- Eligible Scholarships Container -->
      <div class="scholarship-container">
        <h3>Eligible Scholarships</h3>
        <ul>
          <li v-for="scholarship in eligibleScholarships" :key="scholarship.scholarship_id">
            {{ scholarship.scholarship_name }}
            <button @click="handleApplyScholarship(scholarship.scholarship_id)" class="choiceBtn">Apply</button>
          </li>
          <p>{{ applicationMessage }}</p>
        </ul>
      </div>

      <!-- Assigned Scholarships Container -->
      <div class="scholarship-container">
        <h3>Assigned Scholarships</h3>
        <ul>
          <li v-for="scholarship in assignedScholarships" :key="scholarship.scholarship_id">
            {{ scholarship.Scholarships.scholarship_name }}
            <div class="choiceButtons">
              <button class="choiceBtn" @click="acceptScholarship(scholarship.scholarship_id)">Accept</button>
              <button class="choiceBtn reject" @click="rejectScholarship(scholarship.scholarship_id)">Reject</button>
            </div>
          </li>
        </ul>
      </div>

      <!-- Accepted Scholarships Container -->
      <div class="scholarship-container">
        <h3>Accepted Scholarships</h3>
        <ul>
          <li v-for="scholarship in acceptedScholarships" :key="scholarship.scholarship_id">
            {{ scholarship.Scholarships.scholarship_name }}
          </li>
        </ul>
      </div>
    </section>

    <button @click="handleLogout" class="logoutBtn" role="button">Logout</button>
  </div>
</template>

<style scoped>
.student-view {
  text-align: center;
  padding: 20px;
}

.student-details {
  background-color: #ffffff;
  color: #000000;
  padding: 10px;
  margin: 20px 0;
  font-family: Garamond;
}

.scholarships {
  padding: 10px;
  margin: 20px 0;
  font-family: Garamond;
  font-weight: bold;
  color: #000000;
}

/* New container styling for scholarship sections */
.scholarship-container {
  background-color: #ffffff;
  border: 1px solid #ddd;
  padding: 15px;
  margin: 15px 0;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
}

.scholarship-container h3 {
  color: #357260;
  font-family: Garamond;
  font-weight:800
}

h1 {
  color: #357260;
  font-family: Garamond;
  font-style: normal;
}

h2 {
  color: #030303;
  font-family: Garamond;
  font-style: normal;
  font-size: 48px;
}

.choiceBtn {
  background-color: #1a045e;
  color: #ffffff;
  border: 1px solid #5050509d;
  padding: 6px 15px;
  margin: 10px;
  border-radius: 12px;
  box-shadow: 0 10px 10px rgba(230, 202, 222, 0.2);
}

.choiceBtn:hover {
  cursor: pointer;
  background-color: #565a87c1;
  color: #ffffff;
}

.choiceBtn.reject {
  background-color: #902507;
  color: rgb(211, 210, 210);
}

.choiceBtn.reject:hover {
  background-color: #902507;
  cursor: pointer;
}

ul {
  list-style: none;
  padding: 0;
}

.logoutBtn {
  margin-top: 40px;
  padding: 10px 20px;
  font-size: 1em;
  color: #fff;
  background-color: #902507;
  cursor: pointer;
  border-radius: 6px;
  border: 1px solid #902507;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
}

.logoutBtn:hover {
  background-color: #6c4747; /* Darker red on hover */
}
</style>
