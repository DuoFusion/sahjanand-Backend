import express from 'express';
import { orderController } from "../controllers";

const router = express.Router();

router.post('/add', orderController.placeOrder)
router.post('/razorpay', orderController.createRazorpayOrder)
router.post('/verify', orderController.createRazorpayOrder)
router.get('/', orderController.getOrder)

export const orderRoutes = router; 