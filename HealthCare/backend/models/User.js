const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // For password hashing

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true // Remove whitespace from both ends of a string
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensures email is unique
    trim: true,
    lowercase: true, // Store emails in lowercase
    match: [/.+@.+\..+/, 'Please fill a valid email address'] // Basic email format validation
  },
  password: {
    type: String,
    required: true,
    minlength: 6 // Enforce minimum password length
  },
  role: {
    type: String,
    enum: ['doctor', 'nurse', 'receptionist', 'admin'], // Only allowed roles
    required: true
  },
  employeeId: {
     type: String,
     unique: true,
     required: true,
     trim: true
  }
  // You might add a 'roleKey' here temporarily for initial setup,
  // but for a production app, the role key should only be checked during signup and not stored with the user.
  // For simplicity, we'll check it in the route handler.
}, {
  timestamps: true // Adds createdAt and updatedAt fields automatically
});

// Pre-save hook to hash the password before saving a new user or updating password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) { // Only hash if password is new or modified
    return next();
  }
  const salt = await bcrypt.genSalt(10); // Generate a salt (cost factor of 10)
  this.password = await bcrypt.hash(this.password, salt); // Hash the password
  next();
});

// Method to compare entered password with hashed password in the database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;