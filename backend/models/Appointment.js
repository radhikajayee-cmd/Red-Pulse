import mongoose from 'mongoose';
import { MockModel } from './mockDb.js';

const appointmentSchema = new mongoose.Schema({
  donorName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  bloodGroup: { 
    type: String, 
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
  },
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Completed', 'Cancelled'], 
    default: 'Pending' 
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const MongooseAppointment = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);
const MockAppointment = new MockModel('Appointment', appointmentSchema.obj);

const Appointment = new Proxy({}, {
  get(target, prop) {
    if (global.useMockDb) {
      return MockAppointment[prop];
    }
    return MongooseAppointment[prop];
  }
});

export default Appointment;
export { MongooseAppointment, MockAppointment };
