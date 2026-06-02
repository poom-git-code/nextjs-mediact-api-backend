import Router from "koa-router";
import { languageMiddleware } from '../middleware/languageMiddleware';
import {
  createUserGroupTag,
  updateUserGroupTag,
  deleteUserGroupTag,
  getUserGroupTagById,
  getUserGroupTagsByDepartment,
  addUserToGroupTag,
  removeUserFromGroupTag,
  getAllUserGroupTags,
  getUserGroupTags,
  addUserToMultipleGroupTags,
  removeUserFromMultipleGroupTags,
  getUsersByGroupTag,
  getUsersInDepartmentByGroupTags,
  getUserGroupTagsByRole,
  getUserGroupTagsByDepartmentAndRole,
} from "../controllers/userGroupTagController";

const router = new Router();

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

// User Group Tag CRUD
router.post("/user-group-tags", createUserGroupTag);
router.get("/user-group-tags", getAllUserGroupTags);
router.get("/user-group-tags/:id", getUserGroupTagById);
router.put("/user-group-tags/:id", updateUserGroupTag);
router.delete("/user-group-tags/:id", deleteUserGroupTag);

// Get group tags by department
router.get("/departments/:departmentId/user-group-tags", getUserGroupTagsByDepartment);

// Get group tags by role
router.get("/user-group-tags/by-role", getUserGroupTagsByRole);

// Get group tags by department and role
router.get("/user-group-tags/by-department-role", getUserGroupTagsByDepartmentAndRole);

// Get users in department grouped by tags
router.get("/departments/:departmentId/users-by-group-tags", getUsersInDepartmentByGroupTags);

// Manage single group tag members
router.post("/user-group-tags/:id/members", addUserToGroupTag);
router.delete("/user-group-tags/:id/members/:userId", removeUserFromGroupTag);

// Get users by group tag
router.get("/user-group-tags/:id/users", getUsersByGroupTag);

// User-centric operations (1 user, multiple group tags)
router.get("/users/:userId/group-tags", getUserGroupTags);
router.post("/users/:userId/group-tags", addUserToMultipleGroupTags);
router.delete("/users/:userId/group-tags", removeUserFromMultipleGroupTags);

export default router;
