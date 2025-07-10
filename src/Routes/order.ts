import express from 'express';
import { orderController } from "../controllers";

const router = express.Router();

router.post('/add', orderController.placeOrder)

export const orderRoutes = router; 