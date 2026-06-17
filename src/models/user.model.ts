//* mongoose user model
import mongoose from 'mongoose';
import { Schema, type Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// ts interface for mongoose document
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;

  // method
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// mongoose user schema
const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
  },
  { timestamps: true }
);

// pre-operation: hash password before sving
UserSchema.pre<IUser>('save', async function () {
  // check password field is modified or new, then only hash it
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// custome method add into schema - compare password
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// model
export const User = mongoose.model<IUser>('User', UserSchema);
