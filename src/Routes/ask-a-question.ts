import express from 'express';
import { aboutUsController, askAQuestionController } from "../controllers";
import { adminJWT } from '../helper';

const router = express.Router();

router.use(adminJWT)
router.post('/add', askAQuestionController.createAskAQuestion)
router.post('/edit', askAQuestionController.updateAskAQuestion)
router.delete('/:id', askAQuestionController.deleteAskAQuestion)
router.get('/', askAQuestionController.getAskAQuestions)

export const askAQuestionRoutes = router;