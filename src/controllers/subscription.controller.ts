//* Subscription controller

import type { Request, Response } from 'express';
import { Subscription } from '@models/subscription.model.js';
import { CreateSubscriptionSchema, UpdateSubscriptionSchema } from '@dtos/subscription.dto.js';
import { AppError } from '@errors/AppError.js';
import type { Types } from 'mongoose';
import { getLogger } from 'pino-correlation-id';
import { baseLogger } from '@utils/logger.js';

// create subscription
export const createSubscription = async (req: Request, res: Response) => {
  // logger
  const logger = getLogger(baseLogger);

  // validate incoming data
  const validatedDate = CreateSubscriptionSchema.parse(req.body);

  // create the subscription
  const subscription = await Subscription.create({
    ...validatedDate,
    user: req.user!._id, // "!" asserts to TS that protectRoute guarantees this exists
  });

  // log
  logger.info(
    {
      userId: req.user!._id,
      subscriptionId: subscription._id,
      amount: subscription.price,
    },
    'Vault item: Subscription added'
  );

  res.status(201).json({ success: true, data: subscription });
};

// get all subscriptions
export const getSubscriptions = async (req: Request, res: Response) => {
  // subscription belonging to user
  const mySubscriptions = await Subscription.find({
    user: req.user!._id,
  }).sort({
    startDate: -1,
  });

  res.status(200).json({
    success: true,
    count: mySubscriptions.length,
    data: mySubscriptions,
  });
};

// get a subscription by id
export const getSubscriptionById = async (req: Request, res: Response) => {
  // required user._id and subscription._id
  const myOneSubscription = await Subscription.findOne({
    _id: req.params.id as unknown as Types.ObjectId,
    user: req.user!._id as unknown as Types.ObjectId,
  });

  // check exists
  if (!myOneSubscription) {
    throw new AppError('subscription not found or you do not have permission to view it', 404);
  }

  res.status(200).json({
    success: true,
    data: myOneSubscription,
  });
};

// update subscription
export const updateSubscription = async (req: Request, res: Response) => {
  // validate partial update data
  const validatedDate = UpdateSubscriptionSchema.parse(req.body);

  // find and update
  const updateSubscription = await Subscription.findByIdAndUpdate(
    {
      _id: req.params.id,
      user: req.user!._id,
    },
    validatedDate,
    {
      new: true,
      runValidators: true,
    }
  );

  // check exists
  if (!updateSubscription) {
    throw new AppError('Subscription not found or unauthorized', 404);
  }

  res.status(200).json({
    success: true,
    data: updateSubscription,
  });
};

// delete subscription
export const deleteSubscription = async (req: Request, res: Response) => {
  // logger
  const logger = getLogger(baseLogger);

  const subscription = await Subscription.findOneAndDelete({
    _id: req.params.id as unknown as Types.ObjectId,
    user: req.user!._id as unknown as Types.ObjectId,
  });

  // check exists
  if (!subscription) {
    throw new AppError('Subscription not found or unauthorized', 404);
  }

  //log
  logger.info(
    {
      userId: req.user!._id,
      subscriptionId: subscription._id,
    },
    'Vault item: Subscription removed'
  );

  res.status(200).json({
    success: true,
    message: 'Subscription successfully deleted',
  });
};
