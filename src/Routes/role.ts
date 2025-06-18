import express from 'express';
import { checkPermission } from '../middleware/checkPermission';
import { createRole, getRoles, updateRole, deleteRole, getRoleById } from '../controllers/role';

const router = express.Router();

// Role management routes with permission checks
router.post('/create', checkPermission('role', 'create'), createRole);
router.get('/list', checkPermission('role', 'read'), getRoles);
router.get('/:id', checkPermission('role', 'read'), getRoleById);
router.put('/:id', checkPermission('role', 'update'), updateRole);
router.delete('/:id', checkPermission('role', 'delete'), deleteRole);

export const roleRoutes = router; 