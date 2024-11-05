<script setup>
import { defineProps, defineEmits, onMounted, ref } from 'vue';
import { supabase } from '../lib/supabaseClient';
import { runAssignmentProcess, getScholarships } from '../utils/scholarshipManager';

const isProcessing = ref(false);
const message = ref('');
const scholarshipData = ref([]);
const toggleForm = ref(false);

// Form data for new scholarship
const newScholarship = ref({
  scholarship_name: '',
  scholarship_amt: 0,
  max_income: null,
  min_marks: null,
  min_rank: null,
  category_req: null,
  capacity: 0,
  sorting_criteria: null,
  scholarship_provider: null,
});

// Add new scholarship to the database
async function addScholarship() {
  try {
    const scholarshipToInsert = {
      scholarship_name: newScholarship.value.scholarship_name,
      scholarship_amt: newScholarship.value.scholarship_amt,
      max_income: newScholarship.value.max_income,
      min_marks: newScholarship.value.min_marks,
      min_rank: newScholarship.value.min_rank,
      category_req: newScholarship.value.category_req,
      capacity: newScholarship.value.capacity,
      sorting_criteria: newScholarship.value.sorting_criteria,
      scholarship_provider: newScholarship.value.scholarship_provider
    };

    const { data, error } = await supabase.from('Scholarships').insert([scholarshipToInsert]);

    if (error) {
      throw error;
    }
    message.value = 'Scholarship added successfully!';

    // Reset the form and hide it
    newScholarship.value = {
      scholarship_name: '',
      scholarship_amt: 0,
      max_income: null,
      min_marks: null,
      min_rank: null,
      category_req: '',
      capacity: 0,
      sorting_criteria: '',
      scholarship_provider: ''
    };
    toggleForm.value = false;
  } catch (error) {
    console.error('Error adding scholarship:', error);
    message.value = 'Failed to add scholarship.';
  }
}

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

function toggleDisplayForm() {
  toggleForm.value = !(toggleForm.value);
  console.log(toggleForm.value);
}

// Define emits
const emit = defineEmits(['logout']);
// Handle the logout functionality
const handleLogout = () => {
  localStorage.removeItem('admin');
  emit('logout'); // Emit the logout event
};


onMounted(async () => {
  scholarshipData.value = await getScholarships();
});

</script>


<template>
  <div class="admin_dashboard">
    <div class="header">
      <h2>Unified Scholarship Portal</h2>
    </div>
    
    <div class="welcome-section">
      <h1>Welcome, {{ username }}!</h1>
    </div>
    
    <section class="scholarships">
      <div class="container scholarships">
        <h3>List of all Scholarships</h3>
        <ul>
          <li v-for="scholarship in scholarshipData" :key="scholarship.scholarship_id">
            {{ scholarship.scholarship_name }}
          </li>
        </ul>
      </div>
    </section>

    <button @click="triggerAssignmentProcess" :disabled="isProcessing" class="choiceBtn">
      {{ isProcessing ? 'Processing...' : 'Run Assignment Process' }}
    </button>
    <p>{{ message }}</p>


    <button @click="toggleDisplayForm" class="AddScholarship"> ADD Scholarship</button>

    <form @submit.prevent="addScholarship" v-if="toggleForm" class="addScholarshipForm">
      <label for="sch_name">Scholarship Name:</label>
      <input  v-model="newScholarship.scholarship_name" type="text" name="sch_name" id="sch_name" required>
      
      <label for="">Scholarship Amount: </label>
      <input v-model="newScholarship.scholarship_amt" type="number" required>
      
      <label for="max_income">Max Income: </label>
      <input v-model="newScholarship.max_income" type="number" name="max_income" id="max_income">
      
      <label for="min_mark">Min Mark: </label>
      <input v-model="newScholarship.min_marks" type="number" id="min_mark" name="min_mark">
      
      <label for="min_rank">Min Rank: </label>
      <input v-model="newScholarship.min_rank" type="number" name="min_rank" id="min_rank">
      
      <label for="category">Category: </label>
      <select v-model="newScholarship.category_req" name="category" id="category">
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
      </select>

      <label for="capacity">Capacity: </label>
      <input v-model="newScholarship.capacity" type="number" name="capacity" id="capacity">

      <label for="sorting_c">Sorting Criteria: </label>
      <select v-model="newScholarship.sorting_criteria" name="sorting_c" id="sorting_c" required>
        <option value="1">1 - Rank</option>
        <option value="2">2 - Income</option>
      </select>

      
      <label for="provider">Scholarship Provider: </label>
      <select v-model="newScholarship.scholarship_provider" name="provider" id="provider" required>
        <option value="central">Central</option>
        <option value="state">State</option>
        <option value="private">Private</option>
      </select>

      <input type="submit" value="Submit" class="AddScholarship">
    </form>

    <button @click="handleLogout" class="logoutBtn" role="button">Logout</button>
  </div>
</template>

<style scoped>
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
}

h2 {
  color: #000;
  font-weight: 800;
  font-size: 40px;
  margin-bottom: 10px;
  font-family: Helvetica;
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
  border-radius: 6px;
  border-width: 1px;
}

.choiceBtn:hover {
  background-color: #4d4c4b; /* Darker shade for hover effect */
  color: #fff;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
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
  background-color: #ff0000; /* Darker red on hover */
}


ul {
  list-style: none;
}
.logoutBtn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* Container Styles */
.scholarships {
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
}

/* Header Styles */
.scholarships h3 {
  font-size: 24px;
  color: #000000;
  margin-bottom: 15px;
  text-align: center;
}

/* List Styles */
.scholarships ul {
  list-style-type: none; /* Remove default list styling */
  padding: 0;
}

/* List Item Styles */
.scholarships li {
  border: 1px solid #494949;
  border-radius: 8px;
  margin-bottom: 10px;
  padding: 12px 18px;
  transition: background-color 0.3s, transform 0.3s; /* Smooth transitions */
  cursor: pointer;
}

/* Hover Effect */
.scholarships li:hover {
  background-color: #8e8e8e;
  transform: translateY(-2px); /* Slight lift effect */
  color: #fff;
}

/* Active State for Clicked Items */
.scholarships li:active {
  background-color: #e6e6e6;
  transform: translateY(0); /* Reset lift effect */
}

/* Add a simple animation for the list items */
.scholarships li {
  opacity: 0;
  animation: fadeIn 0.5s forwards;
}

/* Animation keyframes */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Button Styles */
.AddScholarship {
  background-color: #4CAF50; /* Green color for a fresh look */
  color: #fff; /* White text for contrast */
  border: none;
  border-radius: 5px;
  padding: 12px 20px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
  margin:12px;
}

/* Hover and Active States */
.AddScholarship:hover {
  background-color: #45a049; /* Darker green on hover */
  transform: translateY(-2px); /* Slight lift effect */
}

.AddScholarship:active {
  background-color: #3e8e41; /* Even darker green on click */
  transform: translateY(0); /* Reset lift effect */
}

/* Focus State for Accessibility */
.AddScholarship:focus {
  outline: 2px solid #80c4ff; /* Blue outline for better focus visibility */
}

.addScholarshipForm {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.addScholarshipForm > input, select, option {
  padding: 10px;
  font-size: 1em;
  background-color: #ffffff;
  color: #000000;
  border-radius: 5px;
}
</style>