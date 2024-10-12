<script setup>
  import { defineProps, defineEmits, onMounted, ref } from 'vue';
  import { supabase } from '../lib/supabaseClient';
  import { assignScholarships, getEligibleScholarships, getStudents, getScholarships, getAssignedScholarships } from '../utils/scholarshipManager';

  const students = ref([]);
  const scholarships = ref([]);
  const eligibleScholarships = ref([]);
  const assignedScholarships = ref([]);
  const userID = localStorage.getItem('studentid');
  const studentData = ref({});
  // Define props
  const props = defineProps({
    username: {
      type: String,
      required: true,
    },
  }); 



  // fetch student data from the database based on userID
  async function getStudentData() {
    // fetch from supabase
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


  // handle accept scholarship event
  async function acceptScholarship(userID, scholarship_id) {
    // fetch status from the table
    const { data, error } = await supabase
    .from("AssignedScholarships")
    .select("status")
    .eq('student_id', userID)
    .eq('scholarship_id', scholarship_id);

    if(error) {
      console.log(`Error fetching data! ${error.message}`);
    } else {
      // if it is accepted or rejected, don't do anything
      if(data[0].status === "accepted" | data[0].status === "rejected") {
        console.log(`Nothing to do here! Already made a decision!`);
      } else if (data[0].status === "pending") {
        console.log(`Scholarship ${scholarship_id} has been accepted!`);
        // update the database
        const { error } = await supabase
        .from("AssignedScholarships")
        .update({ status:  "accepted"})
        .eq('student_id', userID)
        .eq('scholarship_id', scholarship_id);

        if(error) {
          console.log(`Error updating data! ${error.message}`);
        }
      }
    }
  }

   // handle reject scholarship event
  async function rejectScholarship(userID, scholarship_id) {
    // fetch status from the table
    const { data, error } = await supabase
    .from("AssignedScholarships")
    .select("status")
    .eq('student_id', userID)
    .eq('scholarship_id', scholarship_id);

    if(error) {
      console.log(`Error fetching data! ${error.message}`);
    } else {
      // if it is accepted or rejected, don't do anything
      if(data[0].status === "accepted" | data[0].status === "rejected") {
        console.log(`Nothing to do here! Already made a decision!`);
      } else if (data[0].status === "pending") {
        console.log(`Scholarship ${scholarship_id} has been rejected!`);

        // update the database to reflect "rejected" status
        const { error:updateError } = await supabase
        .from("AssignedScholarships")
        .update({ status:  "rejected"})
        .eq('student_id', userID)
        .eq('scholarship_id', scholarship_id);

        if(updateError) {
          console.log(`Error updating data! ${error.message}`);
          return false;
        }

        // update the database to reflect scholarship capacity
        // this calls a postgres function i've created called increaseCapacity 
        // which increments scholarship capacity by 1
        const { data, error:capacityError } = await supabase
        .rpc('increaseCapacity', { sch_id: scholarship_id });

        if(capacityError) {
          console.log(`Error updating data! ${capacityError.message}`);
          return false;
        }
      }
    }
    // Call assignScholarships with updated data
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
    // Update capacity and reject the scholarship
    await rejectScholarship(userID, scholarship_id); // Ensure this updates the scholarship status in the database

    // Step 3: Trigger another round of scholarship assignment
    // Fetch the latest students and scholarships data
    const students = await getStudents();
    const scholarships = await getScholarships();

    // Call assignScholarships with updated data
    await assignScholarships(students, scholarships);
  }



  // this works
  onMounted(async () => {
    students.value = await getStudents();
    scholarships.value = await getScholarships();
    console.log("hello", scholarships.value);
    // console.log(students.value);
    if(students.value && scholarships.value) {
      assignScholarships(students.value, scholarships.value);
    }
    getStudentData();
    eligibleScholarships.value = await getEligibleScholarships(studentData.value, scholarships.value);
    assignedScholarships.value = await getAssignedScholarships(userID);
  })
</script>


<template>
  <div class="home">
    <h1>Welcome, {{ studentData.name }}!</h1>
    <div class="scholarships">
      <div class="eligibles">
        <h3> List of Eligible Scholarships: </h3>
        <ul>
          <li v-for="scholarship in eligibleScholarships" :key="scholarship.scholarship_id">
            {{ scholarship.scholarship_name }}
          </li>
        </ul>
      </div>
      <div class="assigned">
        <h3> List of Assigned Scholarships: </h3>
        <ul>
          <li v-for="item in assignedScholarships" :key="item.scholarship_id">
            {{ item.Scholarships.scholarship_name }}
            <div class="choiceButtons">
              <button class="choiceBtn" @click="acceptScholarship(userID, item.scholarship_id)">
                Accept
              </button>
              <button class="choiceBtn reject" @click="handleRejectScholarship(userID, item.scholarship_id)">
                Reject
              </button>
            </div>
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
}
ul {
  padding: 0;
}
li {
  list-style: none;
}
.scholarships {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 30px;
  padding: 20px;
}

.eligibles > ul > li{
  align-items:flex-start;
}

.logoutBtn {
  display: inline-block;
  outline: 0;
  appearance: none;
  padding: 0px 12px;
  border-radius: 4px;
  text-decoration: none;
  cursor: pointer;
  background-color: rgb(249, 251, 250);
  border: 1px solid rgb(137, 151, 155);
  box-shadow: rgb(6 22 33 / 30%) 0px 1px 2px;
  color: rgb(61, 79, 88);
  font-size: 14px;
  font-weight: 400;
  height: 36px;
  transition: all 150ms ease-in-out 0s;
}

.logoutBtn:hover {
  color: rgb(61, 79, 88);
  background-color: rgb(255, 255, 255);
  border: 1px solid rgb(93, 108, 116);
  box-shadow: rgb(0 0 0 / 30%) 0px 4px 4px, rgb(231 238 236) 0px 0px 0px 3px;
}

.choiceBtn {
  /* display: inline-block; */
  outline: 0;
  appearance: none;
  padding: 0px 12px;
  border: 0px solid transparent;
  border-radius: 4px;
  text-decoration: none;
  cursor: pointer;
  background-color: rgb(9, 128, 76);
  box-shadow: rgb(19 170 82 / 40%) 0px 2px 3px;
  color: rgb(255, 255, 255);
  font-size: 14px;
  font-weight: 400;
  height: 36px;
  transition: all 150ms ease-in-out 0s;
  margin:10px 0 10px 0;
}

.choiceBtn:hover {
  color: rgb(255, 255, 255);
  background-color: rgb(17, 97, 73);
  box-shadow: rgba(19, 170, 82, 0.187) 0px 2px 3px, rgba(195, 231, 202, 0.33) 0px 0px 0px 3px;
}
.reject {
  background-color: rgb(223, 37, 37);
  box-shadow: none;
}

.reject:hover {
  box-shadow:rgba(255, 0, 0, 0.076) 0px 2px 3px, rgba(255, 200, 200, 0.265) 0px 0px 0px 3px;
  background-color: rgb(223, 37, 37);
}

.choiceButtons {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
}

</style>