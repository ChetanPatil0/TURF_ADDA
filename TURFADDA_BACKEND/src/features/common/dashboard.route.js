
import express from 'express'
import { authCheck, authorizeRoles } from "../../middlewares/auth.js";
import {  getAdminDashboardData, getOwnerDashboardData, getStaffDashboardData } from "./dashboard.controller.js";

const router = express.Router();

router.get(
  '/owner/dashboard-data',
  authCheck,
  authorizeRoles('owner'),
  getOwnerDashboardData
);

router.get(
  '/staff/dashboard-data',
  authCheck,
  authorizeRoles('staff'),
  getStaffDashboardData
);


router.get(
  '/admin/dashboard-data',
  authCheck,
  authorizeRoles('superadmin','admin'),
  getAdminDashboardData
);

export default router