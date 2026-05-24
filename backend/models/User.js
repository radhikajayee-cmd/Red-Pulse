import mongoose from 'mongoose';
import { MockModel } from './mockDb.js';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'donor', 'hospital'], required: true },
  phone: { type: String },
  address: { type: String },
  profileImage: { type: String },
}, { timestamps: true });

const MongooseUser = mongoose.models.User || mongoose.model('User', userSchema);
const MockUser = new MockModel('User', userSchema.obj);

const User = new Proxy({}, {
  get(target, prop) {
    if (global.useMockDb) {
      return MockUser[prop];
    }
    return MongooseUser[prop];
  }
});

export default User;
export { MongooseUser, MockUser };
