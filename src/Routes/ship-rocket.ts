import express from 'express';
import { shipRocketController } from '../controllers';

const router = express.Router();

// Order Management Routes
router.post('/orders', shipRocketController.createShipRocketOrder);
router.get('/orders', shipRocketController.getAllShipRocketOrders);
router.get('/orders/:id', shipRocketController.getShipRocketOrderById);
router.delete('/orders/:id', shipRocketController.cancelShipRocketOrder);

// AWB and Pickup Routes
router.post('/orders/:id/awb', shipRocketController.generateAWB);
router.post('/orders/:id/pickup', shipRocketController.requestPickup);

// Tracking Routes
router.get('/track/awb/:awbNumber', shipRocketController.trackShipmentByAWB);
router.get('/orders/:id/track', shipRocketController.trackShipmentByOrderId);

// Courier Routes
router.get('/couriers', shipRocketController.getCouriers);

// Webhook Route
router.post('/webhook', shipRocketController.shipRocketWebhook);

export const shipRocketRoutes = router; 