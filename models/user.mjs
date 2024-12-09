import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    follows: {
        type: [String],
        default: []
    }
}, { timestamps: true }); // Adds `createdAt` and `updatedAt` fields automatically

const User = mongoose.model('User', userSchema);

// Define the 'exists' function to check if any users exist in the database
export const exists = async (query = {}) => {
    const userCount = await User.countDocuments(query);  // Counts how many documents match the query
    return userCount > 0;  // Returns true if at least one user is found, otherwise false
};

export default User;