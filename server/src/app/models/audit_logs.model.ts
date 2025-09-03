import { Document, Schema, Types, model } from 'mongoose';

export interface IAuditLog extends Document {
  user_id: Types.ObjectId | null;
  action_type: string;
  details: string;
  timestamp?: Date;
}

const auditLogSchema = new Schema<IAuditLog>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  action_type: { type: String, required: true },
  details: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const AuditLog = model<IAuditLog>('AuditLog', auditLogSchema);
export default AuditLog;
