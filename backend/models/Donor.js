import mongoose from 'mongoose';
import { MockModel } from './mockDb.js';

const donorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  address: { type: String, required: true },
  lastDonationDate: { type: Date },
  medicalStatus: { type: String, default: 'Healthy' }, // E.g., 'Healthy', 'On Medication', etc.
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const MongooseDonor = mongoose.models.Donor || mongoose.model('Donor', donorSchema);
const MockDonor = new MockModel('Donor', donorSchema.obj);

const Donor = new Proxy({}, {
  get(target, prop) {
    if (global.useMockDb) {
      return MockDonor[prop];
    }
    return MongooseDonor[prop];
  }
});

export default Donor;
export { MongooseDonor, MockDonor };
