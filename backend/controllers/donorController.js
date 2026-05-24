import Donor from '../models/Donor.js';
import User from '../models/User.js';

// @desc    Get all donors with search & filter
// @route   GET /api/donors
// @access  Private (Admin, Hospital)
export const getDonors = async (req, res, next) => {
  try {
    const { search, bloodGroup, gender } = req.query;
    const query = {};

    if (bloodGroup) {
      query.bloodGroup = bloodGroup;
    }

    if (gender) {
      query.gender = gender;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
      ];
    }

    const donors = await Donor.find(query);
    res.json({ success: true, count: donors.length, donors });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single donor
// @route   GET /api/donors/:id
// @access  Private (Admin, Hospital, or owner Donor)
export const getDonorById = async (req, res, next) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({ success: false, message: 'Donor not found' });
    }
    res.json({ success: true, donor });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a donor (Admin only, or manual registration)
// @route   POST /api/donors
// @access  Private (Admin)
export const createDonor = async (req, res, next) => {
  try {
    const { name, email, phone, age, gender, bloodGroup, address, medicalStatus, lastDonationDate } = req.body;

    if (!name || !email || !phone || !age || !gender || !bloodGroup || !address) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // Check if donor with this email already exists
    const donorExists = await Donor.findOne({ email });
    if (donorExists) {
      return res.status(400).json({ success: false, message: 'Donor with this email already exists' });
    }

    const donor = await Donor.create({
      name,
      email,
      phone,
      age: Number(age),
      gender,
      bloodGroup,
      address,
      medicalStatus,
      lastDonationDate: lastDonationDate ? new Date(lastDonationDate) : null,
    });

    res.status(201).json({ success: true, message: 'Donor created successfully', donor });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a donor
// @route   PUT /api/donors/:id
// @access  Private (Admin, or owner Donor)
export const updateDonor = async (req, res, next) => {
  try {
    const { name, email, phone, age, gender, bloodGroup, address, medicalStatus, lastDonationDate } = req.body;

    const donor = await Donor.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({ success: false, message: 'Donor not found' });
    }

    // Update fields
    const updatedFields = {
      name: name || donor.name,
      email: email || donor.email,
      phone: phone || donor.phone,
      age: age ? Number(age) : donor.age,
      gender: gender || donor.gender,
      bloodGroup: bloodGroup || donor.bloodGroup,
      address: address || donor.address,
      medicalStatus: medicalStatus || donor.medicalStatus,
      lastDonationDate: lastDonationDate !== undefined ? (lastDonationDate ? new Date(lastDonationDate) : null) : donor.lastDonationDate,
    };

    const updatedDonor = await Donor.findByIdAndUpdate(req.params.id, updatedFields, { new: true });

    // Sync back user name if associated
    if (donor.userId) {
      const user = await User.findById(donor.userId);
      if (user) {
        user.name = updatedFields.name;
        user.phone = updatedFields.phone;
        user.address = updatedFields.address;
        await user.save();
      }
    }

    res.json({ success: true, message: 'Donor updated successfully', donor: updatedDonor });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete donor
// @route   DELETE /api/donors/:id
// @access  Private (Admin)
export const deleteDonor = async (req, res, next) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({ success: false, message: 'Donor not found' });
    }

    await Donor.findByIdAndDelete(req.params.id);

    // Also delete linked user if exists
    if (donor.userId) {
      await User.findByIdAndDelete(donor.userId);
    }

    res.json({ success: true, message: 'Donor and associated user account deleted successfully' });
  } catch (error) {
    next(error);
  }
};
