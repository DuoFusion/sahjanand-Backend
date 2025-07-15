import { Router } from 'express';
import { ourStoryController } from '../controllers';
import { adminJWT, userJWT } from '../helper';

const router = Router();

router.get('/', ourStoryController.get_all_stories);

router.use(adminJWT)
router.post('/add/edit', ourStoryController.add_edit_our_story);

export const ourStoryRoutes = router;