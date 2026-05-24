import mongoose from 'mongoose';
import { MockModel } from './mockDb.js';

const bloodInventorySchema = new mongoose.Schema({
  bloodGroup: { 
    type: String, 
    required: true, 
    unique: true, 
    enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] 
  },
  units: { type: Number, default: 0, min: 0 },
}, { timestamps: true });

const MongooseBloodInventory = mongoose.models.BloodInventory || mongoose.model('BloodInventory', bloodInventorySchema);
const MockBloodInventory = new MockModel('BloodInventory', bloodInventorySchema.obj);

const BloodInventory = new Proxy({}, {
  get(target, prop) {
    if (global.useMockDb) {
      return MockBloodInventory[prop];
    }
    return MongooseBloodInventory[prop];
  }
});

export default BloodInventory;
export { MongooseBloodInventory, MockBloodInventory };
