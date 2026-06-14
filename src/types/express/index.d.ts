//* User payload
import { Types } from 'mongoose';

// JWt payload and user object
export interface UserPayload {
  _id: Types.ObjectId | string;
  email: string;
}

// globaly merging
declare global {
  namespace Express {
    interface Request {
      // adding optionally user object
      user?: UserPayload;
    }
  }
}

export {};
