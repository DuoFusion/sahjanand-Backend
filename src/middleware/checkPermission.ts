import { roleModel } from '../database';

export const checkPermission = (module: string, action: string) => {
    return async (req, res, next) => {
        try {
            const user = req.user;
            
            // Super admin has all permissions
            if (user.isSuperAdmin) {
                return next();
            }

            // Check if user is admin
            if (!user.isAdmin) {
                return res.status(403).json({
                    status: 403,
                    message: 'Access denied. Admin privileges required.'
                });
            }

            // Get user's role and permissions
            const role = await roleModel.findById(user.role);
            if (!role) {
                return res.status(403).json({
                    status: 403,
                    message: 'Role not found'
                });
            }

            // Check if user has permission for the module and action
            const hasPermission = role.permissions.some(permission => 
                permission.module === module && 
                permission.actions.includes(action)
            );

            if (!hasPermission) {
                return res.status(403).json({
                    status: 403,
                    message: `Access denied. You don't have permission to ${action} ${module}`
                });
            }

            next();
        } catch (error) {
            console.error('Permission check error:', error);
            return res.status(500).json({
                status: 500,
                message: 'Internal server error'
            });
        }
    };
}; 