import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createTask, deleteTask, getTasksByProject, getTasksStats, updateTask } from '../controllers/taskController.js';

const router = express.Router();

// la route est protegee par le middleware 'protect'
// Route POST /api/tasks (Pour la creation d'une tache)
router.post('/', protect, createTask);

router.get('/stats', protect, getTasksStats); // <- avant le /:id pour eviter les conflits

// Route GET /api/tasks/project/:projectId (Pour recuperer les taches d'un projet)
router.get('/project/:projectId', protect, getTasksByProject);

router.put('/:id', protect, updateTask);

router.delete('/:id', protect, deleteTask);

export default router;