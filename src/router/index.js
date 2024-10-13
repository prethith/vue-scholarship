// src/router/index.js

import { createRouter, createWebHistory } from "vue-router";
import LoginView from "@/views/LoginView.vue";
import HomeView from "@/views/HomeView.vue";
import StudentView from "../views/StudentView.vue";
import AdminView from "../views/AdminView.vue";
const routes = [
  {
    path: "/",
    name: "Login",
    component: LoginView,
  },
  {
    path: "/home",
    name: "Home",
    component: HomeView,
    props: true,
  },
  {
    path: "/student",
    name: "Student",
    component: StudentView,
    props: true,
  },
  {
    path: "/admin",
    name: "Admin",
    component: AdminView,
    props: true
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
