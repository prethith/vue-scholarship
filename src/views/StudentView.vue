<script setup>
import { defineProps, defineEmits, onMounted, ref, watch } from 'vue';
import { supabase } from '../lib/supabaseClient';
import { assignScholarships, getEligibleScholarships, getStudents, getScholarships, getAssignedScholarships, applyForScholarship, getAcceptedScholarships } from '../utils/scholarshipManager';

const students = ref([]);
const scholarships = ref([]);
const eligibleScholarships = ref([]);
const assignedScholarships = ref([]);
const userID = localStorage.getItem('studentid');
const studentData = ref({});
const applicationMessage = ref('');
const acceptedScholarships = ref([]);

// Define props
const props = defineProps({
  username: {
    type: String,
    required: true,
  },
});

// Handle applying for eligible scholarships
async function handleApplyScholarship(scholarship_id) {
  console.log(`${userID} applied for scholarship ${scholarship_id}`);
  const result = await applyForScholarship(userID, scholarship_id);
  applicationMessage.value = result.message;
  if (result.success) {
    console.log(`Successfully entered data!`);
  }
}

// Fetch student data from the database based on userID
async function getStudentData() {
  const { data, error } = await supabase
    .from('Students')
    .select()
    .eq('student_id', userID)
    .single();

  if (error) {
    console.error("Error fetching student data", error.message);
  } else {
    studentData.value = data;
  }
}

// Handle accept scholarship event
async function acceptScholarship(userID, scholarship_id) {
  const { data, error } = await supabase
    .from("AssignedScholarships")
    .select("status")
    .eq('student_id', userID)
    .eq('scholarship_id', scholarship_id);

  if (error) {
    console.log(`Error fetching data! ${error.message}`);
  } else {
    if (data[0].status === "accepted" || data[0].status === "rejected") {
      console.log(`Nothing to do here! Already made a decision!`);
      alert(`Nothing to do here! Already made a decision!`);
    } else if (data[0].status === "pending") {
      try {
        const { data: returnInfo, error } = await supabase.rpc('acceptscholarship', {
          p_student_id: userID,
          p_scholarship_id: scholarship_id,
        });

        console.log(returnInfo);
        if (error) {
          if (error.message.includes('Scholarship from this domain already accepted')) {
            console.error('Error: You have already accepted a scholarship from this domain.');
            alert('You have already accepted a scholarship from this domain.');
          } else {
            console.error('Error executing accept_scholarship:', error.message);
          }
        } else {
          console.log('Scholarship accepted and recorded successfully');
          alert('Scholarship accepted successfully!');
        }
      } catch (err) {
        console.error('Error accepting scholarship:', err);
        alert('An unexpected error occurred. Please try again.');
      }
    }
  }
}

// Handle reject scholarship event
async function rejectScholarship(userID, scholarship_id) {
  const { data, error } = await supabase
    .from("AssignedScholarships")
    .select("status")
    .eq('student_id', userID)
    .eq('scholarship_id', scholarship_id);

  if (error) {
    console.log(`Error fetching data! ${error.message}`);
  } else {
    if (data[0].status === "accepted" || data[0].status === "rejected") {
      console.log(`Nothing to do here! Already made a decision!`);
    } else if (data[0].status === "pending") {
      console.log(`Scholarship ${scholarship_id} has been rejected!`);

      const { error: updateError } = await supabase
        .from("AssignedScholarships")
        .update({ status: "rejected" })
        .eq('student_id', userID)
        .eq('scholarship_id', scholarship_id);

      if (updateError) {
        console.log(`Error updating data! ${error.message}`);
        return false;
      }

      const { error: capacityError } = await supabase
        .rpc('increaseCapacity', { sch_id: scholarship_id });

      if (capacityError) {
        console.log(`Error updating data! ${capacityError.message}`);
        return false;
      }
    }
  }
  await assignScholarships(students.value, scholarships.value);
}

// Define emits
const emit = defineEmits(['logout']);

// Handle the logout functionality
const handleLogout = () => {
  localStorage.removeItem('studentid');
  emit('logout'); // Emit the logout event
};

async function handleRejectScholarship(userID, scholarship_id) {
  await rejectScholarship(userID, scholarship_id);

  const students = await getStudents();
  const scholarships = await getScholarships();

  await assignScholarships(students, scholarships);
}

onMounted(async () => {
  students.value = await getStudents();
  scholarships.value = await getScholarships();
  await getStudentData();
  eligibleScholarships.value = await getEligibleScholarships(studentData.value, scholarships.value);
  assignedScholarships.value = await getAssignedScholarships(userID);
  acceptedScholarships.value = await getAcceptedScholarships(userID);
});

watch(acceptedScholarships, async (newV, oldV) => {
  console.log(acceptedScholarships.value);
  await getAcceptedScholarships(userID);
});
</script>

<template>
  <div class="home">
    <div class="header">
      <h2>Unified Scholarship Portal.</h2>
    </div>
    <h1>Welcome, {{ studentData.name }}!</h1>
    
    <div class="scholarships">

      <div class="container eligibles">
        <h3>List of Eligible Scholarships:</h3>
        <ul>
          <li v-for="scholarship in eligibleScholarships" :key="scholarship.scholarship_id">
            {{ scholarship.scholarship_name }}
            <button @click="handleApplyScholarship(scholarship.scholarship_id)" class="choiceBtn">Apply</button>
          </li>
          <p>{{ applicationMessage }}</p>
        </ul>
      </div>

      <!-- Moved Assigned and Accepted Scholarships containers to the bottom -->
      <div class="container assigned">
        <h3>List of Assigned Scholarships:</h3>
        <ul>
          <li v-for="item in assignedScholarships" :key="item.scholarship_id">
            {{ item.Scholarships.scholarship_name }}
            <div class="choiceButtons">
              <button class="choiceBtn" @click="acceptScholarship(userID, item.scholarship_id)">Accept</button>
              <button class="choiceBtn reject" @click="handleRejectScholarship(userID, item.scholarship_id)">Reject</button>
            </div>
          </li>
        </ul>
      </div>

      <div class="container accepted">
        <h3>List of Accepted Scholarships:</h3>
        <ul>
          <li v-for="scholarship in acceptedScholarships" :key="scholarship.scholarship_id">
            {{ scholarship.Scholarships.scholarship_name }}
          </li>
        </ul>
      </div>
      
    </div>
    
    <button @click="handleLogout" class="logoutBtn" role="button">Logout</button>
  </div>
</template>

<style>
.home {
  text-align: center;
  background-color: #050505; /* Background color similar to a login page */
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #070707; /* Darker text for better contrast */
  font-family: Helvetica;
  font-weight: bolder;
  font-style: italic;
  font-size: 28px;
}

h3 {
  color: black; /* Change h3 text color to black */
  font-family: Helvetica;
  font-weight: bolder;
}

.scholarships {
  display: flex;
  flex-direction: column; /* Changed to column for vertical stacking */
  align-items: center; /* Center the items */
  gap: 30px;
  padding: 20px;
  color:#070707;
}

.container {
  background-color: #0a0a0a; /* White background for each list container */
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  padding: 20px;
  width: 1500px; /* Set a fixed width for better alignment */
}

ul {
  padding: 0;
  margin: 0;
  font-family: Helvetica;
  font-weight: bolder;
  font-style: italic;
  color: #050505;
}

li {
  list-style: none;
  margin-bottom: 10px;
  border-radius: 5px;
  font-family: Helvetica;
  font-style: italic;
  
}

.choiceBtn {
  outline: 0;
  appearance: none;
  padding: 0px 12px;
  border: 0px solid transparent;
  border-radius: 4px;
  text-decoration: none;
  cursor: pointer;
  background-color: #070707; /* Bootstrap primary color */
  box-shadow: 0 2px 4px rgba(0, 123, 255, 0.2);
  color: #8b8585;
  font-size: 14px;
  font-weight: 400;
  height: 36px;
  transition: all 150ms ease-in-out 0s;
  font-family: Helvetica;
  font-weight: bold;
}

.choiceBtn.reject {
  background-color: #902507; /* Bootstrap danger color */
}

.choiceBtn:hover {
  background-color: #9c6755; /* Darker shade for hover effect */
}

.logoutBtn {
  display: inline-block;
  padding: 10px 20px;
  background-color: #902507; /* Bootstrap danger color */
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-family: Helvetica;
}

.logoutBtn:hover {
  background-color: #754d40; /* Darker red on hover */
}
</style>
