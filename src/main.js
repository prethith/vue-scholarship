import { createApp } from 'vue'
import './style.css'
import router from './router'
import App from './App.vue'
import { assignScholarships, getEligibleScholarships } from './utils/scholarshipManager'

// // Start the scholarship assignment process
// setInterval(getStudents, 60000);
// setInterval(getScholarships, 60000);
// setInterval(assignScholarships, 60000); // Adjust timing as needed

const app = createApp(App);
app.use(router);
app.mount('#app');

