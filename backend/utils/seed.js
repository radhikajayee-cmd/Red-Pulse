import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Donor from '../models/Donor.js';
import BloodInventory from '../models/BloodInventory.js';
import BloodRequest from '../models/BloodRequest.js';
import Appointment from '../models/Appointment.js';
import Notification from '../models/Notification.js';

dotenv.config();

const seed = async () => {
  // 1. Connect to Database (determines mock or mongo mode)
  await connectDB();
  
  console.log(`Seeding data in [${global.useMockDb ? 'MOCK LOCAL FILE' : 'MONGODB'}] mode...`);

  try {
    // Clear existing data (if mock mode, read/write handles file clears)
    if (!global.useMockDb) {
      console.log('Clearing old collections in MongoDB...');
      await User.deleteMany({});
      await Donor.deleteMany({});
      await BloodInventory.deleteMany({});
      await BloodRequest.deleteMany({});
      await Appointment.deleteMany({});
      await Notification.deleteMany({});
    } else {
      console.log('Clearing local JSON databases...');
      // To clear in mock mode we can just write empty arrays
      // Which is handled by manually wiping files if they exist
      // But we can just overwrite them during creation
    }

    // 2. Hash Password for default users
    const salt = await bcrypt.genSalt(10);
    const hashedAdminPassword = await bcrypt.hash('admin123', salt);
    const hashedDonorPassword = await bcrypt.hash('donor123', salt);
    const hashedHospitalPassword = await bcrypt.hash('hospital123', salt);

    console.log('Seeding Users...');
    
    // Seed Admin
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@bloodbank.com',
      password: hashedAdminPassword,
      role: 'admin',
      phone: '+1 (555) 0199',
      address: 'Main Blood Bank Center, Medical District',
    });

    // Seed Donor User
    const donorUser = await User.create({
      name: 'John Doe',
      email: 'donor@gmail.com',
      password: hashedDonorPassword,
      role: 'donor',
      phone: '+1 (555) 0144',
      address: '742 Evergreen Terrace, Springfield',
    });

    // Seed Hospital User
    const hospitalUser = await User.create({
      name: 'City Central Hospital',
      email: 'hospital@central.com',
      password: hashedHospitalPassword,
      role: 'hospital',
      phone: '+1 (555) 0188',
      address: '456 Healthcare Blvd, Metropolis',
    });

    console.log('Seeding Donors...');
    
    // Seed Donor profile for donorUser
    const donorProfile = await Donor.create({
      name: donorUser.name,
      email: donorUser.email,
      phone: donorUser.phone,
      age: 28,
      gender: 'Male',
      bloodGroup: 'O+',
      address: donorUser.address,
      lastDonationDate: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000), // 100 days ago (eligible)
      medicalStatus: 'Healthy',
      userId: donorUser._id,
    });

    // Seed additional donors
    const otherDonors = [
      { name: 'Sarah Connor', email: 'sarah@skynet.com', phone: '+1 (555) 0101', age: 34, gender: 'Female', bloodGroup: 'A-', address: 'Los Angeles, CA', medicalStatus: 'Healthy' },
      { name: 'Bruce Wayne', email: 'bruce@waynecorp.com', phone: '+1 (555) 0102', age: 40, gender: 'Male', bloodGroup: 'AB+', address: 'Wayne Manor, Gotham', medicalStatus: 'Healthy' },
      { name: 'Peter Parker', email: 'peter@dailybugle.com', phone: '+1 (555) 0103', age: 22, gender: 'Male', bloodGroup: 'B-', address: 'Queens, NY', medicalStatus: 'On Medication' },
      { name: 'Tony Stark', email: 'tony@stark.com', phone: '+1 (555) 0104', age: 48, gender: 'Male', bloodGroup: 'AB-', address: 'Malibu, CA', medicalStatus: 'Healthy' },
    ];

    for (const d of otherDonors) {
      await Donor.create(d);
    }

    console.log('Seeding Blood Stock Inventory...');
    
    // Seed Inventory Stock (Low stock warnings on AB- and B- for demo alerts)
    const stockItems = [
      { bloodGroup: 'A+', units: 25 },
      { bloodGroup: 'A-', units: 14 },
      { bloodGroup: 'B+', units: 18 },
      { bloodGroup: 'B-', units: 8 },  // Low stock
      { bloodGroup: 'O+', units: 30 },
      { bloodGroup: 'O-', units: 12 },
      { bloodGroup: 'AB+', units: 22 },
      { bloodGroup: 'AB-', units: 4 },  // Low stock
    ];

    for (const item of stockItems) {
      await BloodInventory.create(item);
    }

    console.log('Seeding Requests...');
    
    // Seed Blood Requests
    const bloodRequests = [
      {
        patientName: 'Robert Langdon',
        bloodGroup: 'O+',
        unitsRequired: 4,
        hospitalName: 'City Central Hospital',
        emergencyLevel: 'Urgent',
        contactNumber: '+1 (555) 0177',
        reason: 'Severe blood loss during surgery',
        status: 'Approved',
        userId: hospitalUser._id,
      },
      {
        patientName: 'Selina Kyle',
        bloodGroup: 'AB-',
        unitsRequired: 2,
        hospitalName: 'Gotham General Hospital',
        emergencyLevel: 'Critical',
        contactNumber: '+1 (555) 0155',
        reason: 'Trauma accident emergency',
        status: 'Pending',
        userId: hospitalUser._id,
      },
      {
        patientName: 'Clark Kent',
        bloodGroup: 'A+',
        unitsRequired: 5,
        hospitalName: 'Metropolis General Hospital',
        emergencyLevel: 'Normal',
        contactNumber: '+1 (555) 0166',
        reason: 'Scheduled orthopedic procedure',
        status: 'Rejected',
        userId: hospitalUser._id,
      }
    ];

    for (const reqObj of bloodRequests) {
      await BloodRequest.create(reqObj);
    }

    console.log('Seeding Appointments...');
    
    // Seed Appointments
    const appointments = [
      {
        donorName: donorUser.name,
        email: donorUser.email,
        phone: donorUser.phone,
        bloodGroup: 'O+',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // In 2 days
        timeSlot: '10:00 AM - 11:00 AM',
        status: 'Pending',
        userId: donorUser._id,
      },
      {
        donorName: 'Sarah Connor',
        email: 'sarah@skynet.com',
        phone: '+1 (555) 0101',
        bloodGroup: 'A-',
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        timeSlot: '02:00 PM - 03:00 PM',
        status: 'Completed',
      },
      {
        donorName: 'Bruce Wayne',
        email: 'bruce@waynecorp.com',
        phone: '+1 (555) 0102',
        bloodGroup: 'AB+',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // In 5 days
        timeSlot: '11:00 AM - 12:00 PM',
        status: 'Approved',
      }
    ];

    for (const apt of appointments) {
      await Appointment.create(apt);
    }

    console.log('Seeding Notifications...');
    
    // Seed Notifications
    const notifications = [
      {
        title: 'Welcome Admin!',
        message: 'You have successfully set up the Blood Bank Management System dashboard.',
        type: 'success',
        role: 'admin',
      },
      {
        title: 'Low Stock Alert: AB-',
        message: 'The blood stock level for AB- is low (4 units). Please replenish stock soon.',
        type: 'warning',
        role: 'admin',
      },
      {
        title: 'Low Stock Alert: B-',
        message: 'The blood stock level for B- is low (8 units). Please replenish stock soon.',
        type: 'warning',
        role: 'admin',
      },
      {
        title: 'Blood Request Approved',
        message: 'Your request for 4 units of O+ for Robert Langdon has been approved.',
        type: 'success',
        userId: hospitalUser._id,
        role: 'hospital',
      }
    ];

    for (const notif of notifications) {
      await Notification.create(notif);
    }

    console.log('\n======================================');
    console.log('DATABASE SEEDED SUCCESSFULLY!');
    console.log('Use credentials below to log in:');
    console.log('Admin:    admin@bloodbank.com / admin123');
    console.log('Donor:    donor@gmail.com / donor123');
    console.log('Hospital: hospital@central.com / hospital123');
    console.log('======================================\n');
    
    // If MongoDB, disconnect
    if (!global.useMockDb) {
      await mongoose.disconnect();
      console.log('MongoDB connection closed.');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

seed();
