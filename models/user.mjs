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

export default User;