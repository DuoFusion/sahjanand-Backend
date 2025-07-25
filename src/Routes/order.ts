import express from 'express';
import { orderController } from "../controllers";

const router = express.Router();

router.post('/add', orderController.placeOrder)
router.post('/razorpay', orderController.createRazorpayOrder)
router.post('/verify', orderController.verifyRazorpayPayment)
router.get('/', orderController.getOrder)
router.get('/:id', orderController.getOrderById)

export const orderRoutes = router; 