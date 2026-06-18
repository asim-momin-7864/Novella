//* subscription dto
import { z } from 'zod';

// for input validations from zod

// main schema - for create
export const CreateSubscriptionSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  price: z.number().positive('Price must be a positive number'),
  currencyL: z.string().length(3).default('USD'),
  frequency: z.enum(['weekly', 'monthly', 'yearly']),
  category: z.enum(['entertainment', 'productivity', 'utilities', 'other']).default('other'),
  startDate: z.coerce.date().default(() => new Date()),
  status: z.enum(['active', 'cancelled', 'paused']).default('active'),
});

// schema - for update
export const UpdateSubscriptionSchema = CreateSubscriptionSchema.partial();

// export types
export type CreateSubscriptionInput = z.infer<typeof CreateSubscriptionSchema>;
export type UpdateSubscriptionInput = z.infer<typeof UpdateSubscriptionSchema>;
