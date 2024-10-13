import { supabase } from '../lib/supabaseClient'


async function getStudents() {
  const { data, error } = await supabase.from('Students').select().order('student_id', { ascending: true});  
  return data;
  // console.log(students);
}

async function getScholarships() {
  const { data, error } = await supabase.from('Scholarships').select();
  return data;
}


function isEligible(student, scholarship) {
// Initialize a flag to true, assuming the student is eligible
  let eligible = true;
  let atLeastOneConditionChecked = false; // A flag to ensure at least one condition is checked

  // Check if the student's rank meets the requirement
  if (scholarship.min_rank !== null) {
    atLeastOneConditionChecked = true;
    if (student.rank > scholarship.min_rank) {
      eligible = false; // If student's rank is higher than allowed, they're ineligible
    }
  }

  // Check if the student's category matches the requirement
  if (scholarship.category_req !== null) {
    atLeastOneConditionChecked = true;
    if (student.category_ID !== scholarship.category_req) {
      eligible = false; // If student's category doesn't match, they're ineligible
    }
  }

  // Check if the student's income is within the allowed limit
  if (scholarship.max_income !== null) {
    atLeastOneConditionChecked = true;
    if (student.income > scholarship.max_income) {
      eligible = false; // If student's income exceeds the maximum, they're ineligible
    }
  }

  // Check if the student's marks meet the requirement
  if (scholarship.min_marks !== null) {
    atLeastOneConditionChecked = true;
    if (student.marks_12th < scholarship.min_marks) {
      eligible = false; // If student's marks are below the minimum, they're ineligible
    }
  }

  // If no conditions were applicable (all were null), return false
  if (!atLeastOneConditionChecked) {
    eligible = false;
  }

  return eligible;
}


function getEligibleScholarships(student, scholarships) {
  const eligibleScholarships = scholarships.filter(scholarship => {
    const result = isEligible(student, scholarship);
    return result;
  });
  return eligibleScholarships;
}

async function getAssignedScholarships(student_id) {
  // perform join to get the name of assigned scholarships
  const { data, error } = await supabase
    .from("AssignedScholarships")
    .select(`student_id, scholarship_id, Scholarships (scholarship_name)`)
    .eq("student_id", student_id);

  if (error) {
    console.log("Error fetching data: ", error.message);
  } else {
    console.log(`List of assigned scholarships for student ${student_id}`)
    console.log(data);
  }
  return data;
}


// apply for eligible scholarship
async function applyForScholarship(studentId, scholarshipId) {
  const { data, error } = await supabase
    .from("Applications")
    .insert({
      student_id: studentId,
      scholarship_id: scholarshipId,
    });

  if (error) {
    if (error.code === "23505") {
      // Unique constraint violation
      console.error("Student has already applied for this scholarship");
      return {
        success: false,
        message: "You have already applied for this scholarship.",
      };
    }
    console.error("Error applying for scholarship:", error.message);
    return {
      success: false,
      message: "An error occurred while applying for the scholarship.",
    };
  } else {
    console.log(
      `Student ${studentId} applied for scholarship ${scholarshipId}`
    );
    return {
      success: true,
      message: "Successfully applied for the scholarship.",
    };
  }
}


// loop through the list of students

async function assignScholarships() {
  console.log("Starting scholarship assignment process");

  // Fetch all scholarships
  const { data: scholarships, error: scholarshipsError } = await supabase
    .from("Scholarships")
    .select("*");

  if (scholarshipsError) {
    console.error("Error fetching scholarships:", scholarshipsError.message);
    return;
  }

  for (const scholarship of scholarships) {
    console.log(`Processing scholarship: ${scholarship.scholarship_name}`);

    // Fetch pending applications for this scholarship
    const { data: applications, error: applicationsError } = await supabase
      .from("Applications")
      .select("student_id, scholarship_id")
      .eq("scholarship_id", scholarship.scholarship_id)
      .eq("status", "pending");

    if (applicationsError) {
      console.error("Error fetching applications:", applicationsError.message);
      continue;
    }

    // Fetch student details for these applications
    const studentIds = applications.map((app) => app.student_id);
    const { data: students, error: studentsError } = await supabase
      .from("Students")
      .select("*")
      .in("student_id", studentIds);

    if (studentsError) {
      console.error("Error fetching students:", studentsError.message);
      continue;
    }

    // Sort applicants based on the scholarship criteria
    let sortedApplicants = students.sort((a, b) => {
      if (scholarship.sorting_criteria === 1) {
        return a.rank - b.rank;
      } else if (scholarship.sorting_criteria === 2) {
        return a.income - b.income;
      }
      return 0;
    });

    let assignedCount = 0;
    for (const student of sortedApplicants) {
      if (assignedCount >= scholarship.capacity) break;

      if (isEligible(student, scholarship)) {
        // Assign the scholarship
        const { error: assignError } = await supabase
          .from("AssignedScholarships")
          .insert({
            student_id: student.student_id,
            scholarship_id: scholarship.scholarship_id,
            status: "pending",
          });

        if (assignError) {
          console.error("Error assigning scholarship:", assignError.message);
        } else {
          console.log(
            `Assigned ${scholarship.scholarship_name} to student ${student.student_id}`
          );
          assignedCount++;

          // Update application status
          await supabase
            .from("Applications")
            .update({ status: "assigned" })
            .eq("student_id", student.student_id)
            .eq("scholarship_id", scholarship.scholarship_id);
        }
      }
    }

    // Update scholarship capacity
    const { error: updateError } = await supabase
      .from("Scholarships")
      .update({ capacity: scholarship.capacity - assignedCount })
      .eq("scholarship_id", scholarship.scholarship_id);

    if (updateError) {
      console.error(
        "Error updating scholarship capacity:",
        updateError.message
      );
    }
  }

}

 async function getAcceptedScholarships(userID) {
   // fetch the data from the AcceptedScholarship table
   const { data, error } = await supabase
     .from("AcceptedScholarships")
     .select("scholarship_id, Scholarships (scholarship_name)")
     .eq("student_id", userID);

   if (error) {
     console.log(`Error fetching data ${error.message}`);
   } else {
     if (data.length === 0) {
        console.log(`Nothing accepted so far!`);
        return null;
     } else {
       console.log("Accepted Scholarships: ", data);
       return data;
     }
   }
 }

export async function runAssignmentProcess() {
  console.log("Running scholarship assignment process");

  // Fetch all students and scholarships
  const students = await getStudents();
  const scholarships = await getScholarships();

  // Run the assignment process
  await assignScholarships(students, scholarships);

  console.log("Scholarship assignment process completed");
}

// export functions to be used in other files
export { assignScholarships, getEligibleScholarships, getStudents, getScholarships, getAssignedScholarships, applyForScholarship, getAcceptedScholarships };