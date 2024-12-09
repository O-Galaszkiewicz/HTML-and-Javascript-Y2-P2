import User, { exists } from '../models/user.mjs';
import { hashPassword } from "./bcryptUtils.mjs";

const ensureDatabaseSetup = async () => {
    // Check if the 'users' collection has any data (check if the collection exists)
    const userExists = await exists({});  // This checks if any user is present
    
    if (!userExists) {
        console.log("Users collection doesn't exist or is empty. Initializing...");
        
        // Create a default admin user
        const adminUser = new User({
            username: "admin",
            password: await hashPassword("adminpassword"),  // Make sure to hash the password
            email: "admin@example.com",
            follows: [],
        });
        
        await adminUser.save();  // Save the admin user to the database
        console.log("Admin user created!");
    }
};

export default ensureDatabaseSetup;
