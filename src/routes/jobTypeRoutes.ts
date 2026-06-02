import Router from "koa-router";
import * as JobTypeController from "../controllers/jobTypeController";
import { languageMiddleware } from "../middleware/languageMiddleware";

const router = new Router({ prefix: "/job-types" });

// Apply language middleware to all routes
router.use(languageMiddleware);

// CRUD operations
router.get("/", JobTypeController.getAllJobTypes);                    
router.get("/code/:code", JobTypeController.getJobTypeByCode);        
router.get("/:id", JobTypeController.getJobTypeById);                 
router.post("/", JobTypeController.createJobType);                    
router.put("/:id", JobTypeController.updateJobType);                  
router.delete("/:id", JobTypeController.deleteJobType);               
router.delete("/hard/:id", JobTypeController.hardDeleteJobType);      

export default router;