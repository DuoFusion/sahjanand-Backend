import { seedRoles } from './roles';

export const runSeeds = async () => {
    try {
        await seedRoles();
        console.log('All seeds completed successfully');
    } catch (error) {
        console.log('Error running seeds:', error);
    }
}; 