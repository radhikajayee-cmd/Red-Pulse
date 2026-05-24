import mongoose from 'mongoose';
import { MockModel } from './mockDb.js';

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['info', 'warning', 'success', 'error'], 
    default: 'info' 
  },
  role: { 
    type: String, 
    enum: ['all', 'admin', 'donor', 'hospital'], 
    default: 'all' 
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  read: { type: Boolean, default: false },
}, { timestamps: true });

const MongooseNotification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
const MockNotification = new MockModel('Notification', notificationSchema.obj);

const Notification = new Proxy({}, {
  get(target, prop) {
    if (global.useMockDb) {
      return MockNotification[prop];
    }
    return MongooseNotification[prop];
  }
});

export default Notification;
export { MongooseNotification, MockNotification };
