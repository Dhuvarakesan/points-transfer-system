import { Document, Schema, Types, model } from 'mongoose';

export interface ITransaction extends Document {
  sender_id: Types.ObjectId;
  receiver_id: Types.ObjectId;
  amount: number;
  status: 'success' | 'failed' | 'pending';
  createdAt?: Date;
  updatedAt?: Date;
}

const transactionSchema = new Schema<ITransaction>({
  sender_id: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  receiver_id: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['success', 'failed', 'pending'], default: 'pending' },
}, { timestamps: true });

const Transaction = model<ITransaction>('Transaction', transactionSchema);
export default Transaction;
