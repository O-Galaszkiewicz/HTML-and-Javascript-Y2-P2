import bcrypt from 'bcryptjs';

const saltRounds = 10;

// Hash password
export const hashPassword = async (password) => {
    try {
        const hashedPass = await bcrypt.hash(password, saltRounds);
        return hashedPass;
    } catch (err) {
        throw new Error('Error hashing password');
    }
};

// Compare password with hashed password
export const comparePassword = async (password, hashedPass) => {
    try {
        const isMatch = await bcrypt.compare(password, hashedPass);
        return isMatch;
    } catch (err) {
        throw new Error('Error comparing passwords');
    }
};
