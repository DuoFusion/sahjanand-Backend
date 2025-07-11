import express from 'express';
import { orderController } from "../controllers";

const router = express.Router();

router.post('/add', orderController.placeOrder)
router.get('/', orderController.getOrder)

export const orderRoutes = router; 