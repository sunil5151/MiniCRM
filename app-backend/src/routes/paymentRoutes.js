import express from 'express';
import { 
  getAllPayments, 
  getPaymentStats, 
  getPaymentById, 
  createPayment, 
  updatePaymentStatus 
} from '../controllers/paymentController.js';

const router = express.Router();

// Payment routes
router.get('/', getAllPayments);
router.get('/stats', getPaymentStats);
router.get('/:paymentId', getPaymentById);
router.post('/', createPayment);
router.put('/:paymentId/status', updatePaymentStatus);

export default router;