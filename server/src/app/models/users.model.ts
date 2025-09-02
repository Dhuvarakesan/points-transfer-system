import CryptoJS from 'crypto-js';
import { Document, Schema, Types, model } from 'mongoose';
import { secretKey } from '../../config/config';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  points_balance: number;
  status: 'active' | 'inactive' | 'suspended';
  createdAt?: Date;
  updatedAt?: Date;
  comparePassword(enteredPassword: string): boolean;
  decryptPassword(): string;
  safeData: IUserSafeData;
}

export interface IUserSafeData {
  _id: string;
  name: string;
  email: string;
  role: string;
  points_balance: number;
  status: 'active' | 'inactive' | 'suspended';
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true, minlength: 3, maxlength: 50 },
  email: { type: String, required: true, unique: true, lowercase: true, match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'], index: true },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
  },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  points_balance: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
}, { timestamps: true });

userSchema.pre<IUser>('save', function (next) {
  if (!this.isModified('password')) return next();
  try {
    this.password = CryptoJS.AES.encrypt(this.password, secretKey).toString();
    next();
  } catch (error: any) {
    next(error);
  }
});

// 5. Instance method to compare entered password with encrypted password
userSchema.methods.comparePassword = function (this: IUser, enteredPassword: string): boolean {
  
  const decryptedPassword = CryptoJS.AES.decrypt(this.password, secretKey).toString(CryptoJS.enc.Utf8);
  return enteredPassword === decryptedPassword;
};

// 6. Instance method to decrypt password
userSchema.methods.decryptPassword = function (this: IUser): string {
  return CryptoJS.AES.decrypt(this.password, secretKey).toString(CryptoJS.enc.Utf8);
};


userSchema.virtual('safeData').get(function (this: IUser): IUserSafeData {
  return {
    _id: (this._id as Types.ObjectId).toString(),
    name: this.name,
    email: this.email,
    role: this.role,
    points_balance: this.points_balance,
    status: this.status,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
});

const User = model<IUser>('User', userSchema);
export default User;
