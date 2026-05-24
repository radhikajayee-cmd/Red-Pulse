import mongoose from 'mongoose';
import { MockModel } from './mockDb.js';

const bloodRequestSchema = new mongoose.Schema({
  patientName: { type: String, required: true },
  bloodGroup: { 
    type: String, 
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
  },
  unitsRequired: { type: Number, required: true, min: 1 },
  hospitalName: { type: String, required: true },
  emergencyLevel: { 
    type: String, 
    required: true,
    enum: ['Normal', 'Urgent', 'Critical'],
    default: 'Normal'
  },
  contactNumber: { type: String, required: true },
  reason: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'], 
    default: 'Pending' 
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const MongooseBloodRequest = mongoose.models.BloodRequest || mongoose.model('BloodRequest', bloodRequestSchema);
const MockBloodRequest = new MockModel('BloodRequest', bloodRequestSchema.obj);

const BloodRequest = new Proxy({}, {
  get(target, prop) {
    if (global.useMockDb) {
      return MockBloodRequest[prop];
    }
    return MongooseBloodRequest[prop];
  }
});

export default BloodRequest;
export { MongooseBloodRequest, MockBloodRequest };
