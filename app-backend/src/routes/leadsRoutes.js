import express from 'express';
import { 
  getAllLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  getLeadsStats,
  getLeadsByUser
} from '../controllers/leadsController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Leads routes
router.get('/', getAllLeads);
router.get('/stats', getLeadsStats);
router.get('/user/:userId', requireAdmin, getLeadsByUser); // Admin only - get leads by user
router.get('/:leadId', getLeadById);
router.post('/', createLead);
router.put('/:leadId', updateLead);
router.delete('/:leadId', deleteLead);

export default router;
