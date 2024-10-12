import { supabase } from '../lib/supabaseClient'


let assignedScholarships = {};
let acceptedScholarships = {};
// const choiceMade = ref(false);

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

// loop through the list of students

async function assignScholarships(students, scholarships) {
  console.log("Starting scholarship assignment process");

  // Ensure data is fetched before processing
  await Promise.all([getStudents(), getScholarships()]); // Wait for both fetches

  // Check if students and scholarships have valid data
  if (!students || !Array.isArray(students) || students.length === 0) {
    console.error("No students data available");
    return;
  }

  if (
    !scholarships ||
    !Array.isArray(scholarships) ||
    scholarships.length === 0
  ) {
    console.error("No scholarships data available");
    return;
  }

  for (const scholarship of scholarships) {
    console.log(`Processing scholarship: ${scholarship.scholarship_name}`);

    // Fetch the current capacity from the database
    const { data: currentScholarship, error: fetchScholarshipError } =
      await supabase
        .from("Scholarships")
        .select("capacity")
        .eq("scholarship_id", scholarship.scholarship_id)
        .single();

    if (fetchScholarshipError) {
      console.error(
        "Error fetching current scholarship capacity:",
        fetchScholarshipError.message
      );
      continue;
    }

    // Use the fetched capacity instead of the local variable
    if (currentScholarship.capacity <= 0) {
      console.log(
        `No capacity left for ${scholarship.scholarship_name}. Skipping.`
      );
      continue;
    }

    // Sort students based on criteria
    if (scholarship.sorting_criteria === 1) {
      students.sort((a, b) => a.rank - b.rank);
    } else if (scholarship.sorting_criteria === 2) {
      students.sort((a, b) => a.income - b.income);
    }

    // Loop through sorted students to assign the scholarship
    for (const student of students) {
      // Check if this student has already been assigned or rejected this scholarship
      const { data: assignmentData, error: assignmentCheckError } =
        await supabase
          .from("AssignedScholarships")
          .select("status")
          .eq("student_id", student.student_id)
          .eq("scholarship_id", scholarship.scholarship_id)
          .limit(1);

      if (assignmentCheckError) {
        console.error(
          "Error checking for assigned/rejected scholarships:",
          assignmentCheckError.message
        );
        continue;
      }

      // Skip if the scholarship was previously assigned or rejected by this student
      if (assignmentData.length > 0) {
        console.log(
          `Skipping student ${student.student_id} for scholarship ${scholarship.scholarship_id} (status: ${assignmentData[0].status})`
        );
        continue;
      }

      if (isEligible(student, scholarship)) {
        // Double-check the current capacity before assigning
        const { data: latestCapacity, error: latestCapacityError } =
          await supabase
            .from("Scholarships")
            .select("capacity")
            .eq("scholarship_id", scholarship.scholarship_id)
            .single();

        if (latestCapacityError) {
          console.error(
            "Error fetching latest scholarship capacity:",
            latestCapacityError.message
          );
          continue;
        }

        if (latestCapacity.capacity > 0) {
          // Assign the scholarship
          const { data, error: assignError } = await supabase
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

            // Decrease the capacity
            const { data: updatedCapacity, error: decreaseError } =
              await supabase.rpc("decreaseCapacity", {
                sch_id: scholarship.scholarship_id,
              });

            if (decreaseError) {
              console.error(
                "Error updating scholarship capacity:",
                decreaseError.message
              );
            } else {
              console.log(
                `Updated capacity of ${scholarship.scholarship_name} to ${updatedCapacity}`
              );
            }

            // Break the loop if we've assigned the scholarship
            break;
          }
        } else {
          console.log(
            `No capacity left for ${scholarship.scholarship_name}. Moving to next scholarship.`
          );
          break;
        }
      }
    }
  }
  console.log("Scholarship assignment process completed");
}

// export functions to be used in other files
export { assignScholarships, getEligibleScholarships, getStudents, getScholarships, getAssignedScholarships };