import { db } from './config.js';
import { ref, get, child } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// Session storage keys
const USER_KEY = 'kbs_user';

export const AuthService = {
    async login(username, password) {
        try {
            const dbRef = ref(db);
            // Fetch users (Note: In a real production app with RTDB auth, this should be done securely, usually via Firebase Auth. 
            // Following spec to use RTDB /users node for auth).
            const snapshot = await get(child(dbRef, `users`));
            
            if (snapshot.exists()) {
                const users = snapshot.val();
                let foundUser = null;
                let userKey = null;

                // Find user by username
                for (const [key, user] of Object.entries(users)) {
                    if (user.username === username && user.password === password) {
                        foundUser = user;
                        userKey = key;
                        break;
                    }
                }

                if (foundUser) {
                    if (!foundUser.isActive) {
                        throw new Error("Account is deactivated.");
                    }
                    
                    const sessionData = {
                        uid: userKey,
                        username: foundUser.username,
                        name: foundUser.name,
                        role: foundUser.role
                    };
                    
                    sessionStorage.setItem(USER_KEY, JSON.stringify(sessionData));
                    this.redirectBasedOnRole(foundUser.role);
                    return true;
                } else {
                    throw new Error("Invalid username or password.");
                }
            } else {
                throw new Error("No users found in database.");
            }
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    },

    logout() {
        sessionStorage.removeItem(USER_KEY);
        window.location.href = 'index.html';
    },

    getCurrentUser() {
        const userData = sessionStorage.getItem(USER_KEY);
        return userData ? JSON.parse(userData) : null;
    },

    requireRole(allowedRoles) {
        const user = this.getCurrentUser();
        if (!user) {
            window.location.href = 'index.html';
            return null;
        }

        if (!allowedRoles.includes(user.role)) {
            // Unauthorized, redirect based on their actual role or to login
            this.redirectBasedOnRole(user.role);
            return null;
        }

        return user;
    },

    redirectBasedOnRole(role) {
        switch(role) {
            case 'ADMIN':
                window.location.href = 'admin.html';
                break;
            case 'PACKAGING':
                window.location.href = 'packer.html';
                break;
            case 'WAREHOUSE':
                window.location.href = 'warehouse.html';
                break;
            default:
                window.location.href = 'index.html';
        }
    }
};
