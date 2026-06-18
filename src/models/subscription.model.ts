//* subscription model for DB
import mongoose from 'mongoose';
import { Schema, type Document } from 'mongoose';

//type for schemas

export interface ISubscription extends Document {
  user: mongoose.Types.ObjectId; // Relational link to user
  name: string;
  price: number;
  currency: string;
  frequency: 'weekly' | 'monthly' | 'yearly';
  category: string;
  startDate: Date;
  status: 'active' | 'cancelled' | 'paused';
  createdAt: Date;
  updatedAt: Date;
}

// schema
const SubscriptionSchema = new Schema<ISubscription>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: 'USD',
    },
    frequency: {
      type: String,
      enum: ['weekly', 'monthly', 'yearly'],
      required: true,
    },
    category: {
      type: String,
      required: true,
      default: 'other',
    },
    startDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'paused'],
      default: 'active',
    },
  },

  { timestamps: true }
);

// export
export const Subscription = mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
