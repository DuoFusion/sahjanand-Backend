import { roleModel } from '../models/role';

const defaultRoles = [
    {
        name: 'Super Admin',
        description: 'Has full access to all modules and actions',
        permissions: [
            {
                module: 'all',
                actions: ['create', 'read', 'update', 'delete', 'manage']
            }
        ]
    },
    {
        name: 'Product Manager',
        description: 'Manages products and categories',
        permissions: [
            {
                module: 'product',
                actions: ['create', 'read', 'update', 'delete', 'manage']
            },
            {
                module: 'category',
                actions: ['create', 'read', 'update', 'delete', 'manage']
            }
        ]
    },
    {
        name: 'Order Manager',
        description: 'Manages orders and customer interactions',
        permissions: [
            {
                module: 'order',
                actions: ['create', 'read', 'update', 'delete', 'manage']
            },
            {
                module: 'customer',
                actions: ['read', 'update']
            }
        ]
    }
];

export const seedRoles = async () => {
    try {
        // Check if roles already exist
        const existingRoles = await roleModel.find();
        if (existingRoles.length > 0) {
            console.log('Roles already exist, skipping seed');
            return;
        }

        // Create default roles
        await roleModel.insertMany(defaultRoles);
        console.log('Default roles created successfully');
    } catch (error) {
        console.error('Error seeding roles:', error);
    }
};