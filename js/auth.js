import { db } from './config.js';
import { ref, get, child } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// Session storage keys
const USER_KEY = 'kbs_user';

const MASTER_ADMIN = {
  username: "gebaly27",
  password: "gebo777",
  name: "Mr. Gebaly",
  role: "ADMIN"
};

export const AuthService = {
    async login(username, password) {
        return new Promise(async (resolve, reject) => {
            // Safety Timeout to prevent infinite spinning
            const timeoutGuard = setTimeout(() => {
                reject(new Error("انتهت مهلة الاتصال، يرجى المحاولة مجدداً"));
            }, 4000);

            try {
                // 1. Check Master Admin Credentials
                if (username.toLowerCase() === MASTER_ADMIN.username.toLowerCase() && password === MASTER_ADMIN.password) {
                    clearTimeout(timeoutGuard);
                    sessionStorage.setItem(USER_KEY, JSON.stringify(MASTER_ADMIN));
                    this.redirectBasedOnRole(MASTER_ADMIN.role);
                    resolve(true);
                    return;
                }

                // 2. Check Firebase Users
                const dbRef = ref(db);
                const snapshot = await get(child(dbRef, `artifacts/korean-beautys-dispatch/users`));
                
                if (snapshot.exists()) {
                    const users = snapshot.val();
                    let foundUser = null;
                    let userKey = null;

                    for (const [key, user] of Object.entries(users)) {
                        if (user.username && user.username.toLowerCase() === username.toLowerCase() && user.password === password) {
                            foundUser = user;
                            userKey = key;
                            break;
                        }
                    }

                    if (foundUser) {
                        if (foundUser.isActive === false) {
                            clearTimeout(timeoutGuard);
                            reject(new Error("Account is deactivated."));
                            return;
                        }
                        
                        const sessionData = {
                            uid: userKey,
                            username: foundUser.username,
                            name: foundUser.name,
                            role: foundUser.role
                        };
                        
                        clearTimeout(timeoutGuard);
                        sessionStorage.setItem(USER_KEY, JSON.stringify(sessionData));
                        this.redirectBasedOnRole(foundUser.role);
                        resolve(true);
                        return;
                    }
                }
                
                clearTimeout(timeoutGuard);
                reject(new Error("اسم المستخدم أو كلمة المرور غير صحيحة"));

            } catch (error) {
                clearTimeout(timeoutGuard);
                console.error("Login error:", error);
                reject(new Error("حدث خطأ أثناء الاتصال بالسيرفر"));
            }
        });
    },

    logout() {
        sessionStorage.removeItem(USER_KEY);
        localStorage.removeItem(USER_KEY); // Clean up legacy keys
        window.location.replace('index.html');
    },

    getCurrentUser() {
        const userData = sessionStorage.getItem(USER_KEY);
        return userData ? JSON.parse(userData) : null;
    },

    requireRole(allowedRoles) {
        const user = this.getCurrentUser();
        if (!user) {
            window.location.replace('index.html');
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
                window.location.replace('admin.html');
                break;
            case 'PACKAGING':
                window.location.replace('packer.html');
                break;
            case 'WAREHOUSE':
                window.location.replace('warehouse.html');
                break;
            default:
                window.location.replace('index.html');
        }
    }
};
