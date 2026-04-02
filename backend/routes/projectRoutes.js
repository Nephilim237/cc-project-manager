import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createProject, deleteProject, getProjects, updateProject, addMember } from "../controllers/ProjectController.js";
const router = express.Router();

// la route est protegee par le middleware 'protect'
// Route POST /api/projects (Pour la creation d'un projet)
router.post("/", protect, createProject);

// Route GET /api/projects (Pour recuperer les projets)
router.get("/", protect, getProjects);

router.put("/:id", protect, updateProject);

router.delete("/:id", protect, deleteProject);

router.post('/:id/members', protect, addMember);

export default router;
