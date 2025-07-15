import { Router } from 'express';
import { ourStoryController } from '../controllers';
import { adminJWT, userJWT } from '../helper';

const router = Router();

router.use(userJWT)
router.get('/all', ourStoryController.getAllOurStories);

router.use(adminJWT)
router.post('/add', ourStoryController.createOurStory);
router.post('/edit', ourStoryController.updateOurStory);
router.delete('/:id', ourStoryController.deleteOurStory);
router.get('/:id', ourStoryController.getOurStoryById);

export const ourStoryRoutes = router;