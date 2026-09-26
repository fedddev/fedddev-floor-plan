import { createRouter, createWebHistory } from "vue-router";
import Facility from "../views/Facility.vue";
import Globe from "../views/Globe.vue";

const routes = [
  {
    path: "/",
    name: "Globe",
    component: Globe,
    meta: {
      roles: [],
    },
  },
  {
    path: "/facility/:name",
    name: "Facility",
    component: Facility,
    meta: {
      roles: [],
    },
  },
  // Always leave this as last one
  {
    path: "/logout",
    redirect: { name: "Globe" },
  },
  {
    path: "/facility/logout",
    redirect: { name: "Globe" },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "Error",
    component: () => import("@/views/Error.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
