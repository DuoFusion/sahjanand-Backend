import express from 'express';
import { createRole, getRoles, updateRole, deleteRole, getRoleById } from '../controllers/role';

const router = express.Router();

// Role management routes with permission checks
router.post('/create', createRole);
router.get('/list', getRoles);
router.get('/:id', getRoleById);
router.put('/:id', updateRole);
router.delete('/:id', deleteRole);

export const roleRoutes = router; 