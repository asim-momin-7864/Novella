//* Subscription route
import { Router } from 'express';
import { protectRoute } from '@middlewares/protectRoute.middleware.js';
import {
  createSubscription,
  getSubscriptions,
  getSubscriptionById,
  updateSubscription,
  deleteSubscription,
} from '@controllers/subscription.controller.js';

// insatnce router
const router = Router();

// apply protectRoute to all routes in this file
router.use(protectRoute);

router.route('/').post(createSubscription).get(getSubscriptions);

router.route('/:id').get(getSubscriptionById).patch(updateSubscription).delete(deleteSubscription);

export default router;
