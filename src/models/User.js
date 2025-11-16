const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * User Model for FarmFresh
 * Handles user registration, authentication, and user data management
 */
class User {
    constructor() {
        this.dataFile = path.join(__dirname, '../../data/users.json');
        this.salt = 'farmfresh_salt';
        this.data = this.loadUsers();
    }

    /**
     * Load users from JSON file
     */
    loadUsers() {
        try {
            if (fs.existsSync(this.dataFile)) {
                const data = fs.readFileSync(this.dataFile, 'utf8');
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('Error loading users:', error);
        }
        return this.initializeDatabase();
    }

    /**
     * Initialize empty database structure
     */
    initializeDatabase() {
        return {
            users: [],
            nextId: 1,
            sessions: {}
        };
    }

    /**
     * Save users to JSON file
     */
    saveUsers() {
        try {
            const dir = path.dirname(this.dataFile);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(this.dataFile, JSON.stringify(this.data, null, 2));
            return true;
        } catch (error) {
            console.error('Error saving users:', error);
            return false;
        }
    }

    /**
     * Hash password using SHA-256 with salt
     */
    hashPassword(password) {
        return crypto.createHash('sha256')
            .update(password + this.salt)
            .digest('hex');
    }

    /**
     * Verify password
     */
    verifyPassword(password, hashedPassword) {
        const hashed = this.hashPassword(password);
        return hashed === hashedPassword;
    }

    /**
     * Validate registration data
     */
    validateRegistrationData(userData) {
        const errors = [];

        // Required fields validation
        if (!userData.firstName || userData.firstName.trim() === '') {
            errors.push('First name is required');
        }

        if (!userData.lastName || userData.lastName.trim() === '') {
            errors.push('Last name is required');
        }

        if (!userData.email || userData.email.trim() === '') {
            errors.push('Email is required');
        } else if (!this.isValidEmail(userData.email)) {
            errors.push('Invalid email format');
        }

        if (!userData.password || userData.password.trim() === '') {
            errors.push('Password is required');
        } else if (!this.isValidPassword(userData.password)) {
            errors.push('Password must be at least 8 characters with uppercase, lowercase, and number');
        }

        if (!userData.confirmPassword || userData.confirmPassword.trim() === '') {
            errors.push('Password confirmation is required');
        } else if (userData.password !== userData.confirmPassword) {
            errors.push('Passwords do not match');
        }

        if (!userData.postcode || userData.postcode.trim() === '') {
            errors.push('Postcode is required');
        }

        if (!userData.termsAccepted) {
            errors.push('You must accept the terms and conditions');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Validate email format
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate password strength
     */
    isValidPassword(password) {
        if (password.length < 8) {
            return false;
        }
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        return hasUpperCase && hasLowerCase && hasNumbers;
    }

    /**
     * Check if user exists by email
     */
    findByEmail(email) {
        if (!email) return null;
        return this.data.users.find(
            user => user.email.toLowerCase() === email.toLowerCase()
        );
    }

    /**
     * Check if user exists by ID
     */
    findById(id) {
        return this.data.users.find(user => user.id === id);
    }

    /**
     * Get next user ID
     */
    getNextId() {
        const nextId = this.data.nextId;
        this.data.nextId += 1;
        return nextId;
    }

    /**
     * Create new user (register)
     */
    create(userData) {
        // Validate registration data
        const validation = this.validateRegistrationData(userData);
        if (!validation.isValid) {
            return {
                success: false,
                message: validation.errors.join(', '),
                errors: validation.errors
            };
        }

        // Check if user already exists
        const existingUser = this.findByEmail(userData.email);
        if (existingUser) {
            return {
                success: false,
                message: 'User with this email already exists',
                errors: ['Email already registered']
            };
        }

        // Create new user object
        const newUser = {
            id: this.getNextId(),
            firstName: userData.firstName.trim(),
            lastName: userData.lastName.trim(),
            email: userData.email.toLowerCase().trim(),
            phone: userData.phone ? userData.phone.trim() : '',
            password: this.hashPassword(userData.password),
            postcode: userData.postcode.trim(),
            termsAccepted: userData.termsAccepted || false,
            newsletter: userData.newsletter || false,
            createdAt: new Date().toISOString(),
            lastLogin: null,
            isActive: true
        };

        // Add user to database
        this.data.users.push(newUser);
        
        // Save to file
        const saved = this.saveUsers();
        if (!saved) {
            return {
                success: false,
                message: 'Failed to save user data',
                errors: ['Database error']
            };
        }

        // Return user without password
        const { password, ...userWithoutPassword } = newUser;
        return {
            success: true,
            message: 'Registration successful! Welcome to FarmFresh!',
            user: userWithoutPassword
        };
    }

    /**
     * Authenticate user (login)
     */
    authenticate(email, password) {
        if (!email || !password) {
            return {
                success: false,
                message: 'Email and password are required',
                user: null
            };
        }

        const user = this.findByEmail(email);
        if (!user) {
            return {
                success: false,
                message: 'Invalid email or password',
                user: null
            };
        }

        if (!this.verifyPassword(password, user.password)) {
            return {
                success: false,
                message: 'Invalid email or password',
                user: null
            };
        }

        if (!user.isActive) {
            return {
                success: false,
                message: 'Account is deactivated. Please contact support.',
                user: null
            };
        }

        // Update last login
        user.lastLogin = new Date().toISOString();
        this.saveUsers();

        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        return {
            success: true,
            message: 'Login successful!',
            user: userWithoutPassword
        };
    }

    /**
     * Get all users (without passwords)
     */
    getAll() {
        return this.data.users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
    }

    /**
     * Get user by ID (without password)
     */
    getById(id) {
        const user = this.findById(id);
        if (!user) {
            return null;
        }
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    /**
     * Update user
     */
    update(id, updates) {
        const userIndex = this.data.users.findIndex(user => user.id === id);
        if (userIndex === -1) {
            return {
                success: false,
                message: 'User not found'
            };
        }

        const user = this.data.users[userIndex];

        // Don't allow updating password through this method
        if (updates.password) {
            delete updates.password;
        }

        // Don't allow updating email (would need separate verification)
        if (updates.email && updates.email !== user.email) {
            return {
                success: false,
                message: 'Email cannot be changed'
            };
        }

        // Update allowed fields
        const allowedFields = ['firstName', 'lastName', 'phone', 'postcode', 'newsletter', 'isActive'];
        const updatedFields = {};
        
        allowedFields.forEach(field => {
            if (updates[field] !== undefined) {
                updatedFields[field] = updates[field];
            }
        });

        // Update user
        this.data.users[userIndex] = {
            ...user,
            ...updatedFields
        };

        const saved = this.saveUsers();
        if (!saved) {
            return {
                success: false,
                message: 'Failed to update user data'
            };
        }

        const { password, ...userWithoutPassword } = this.data.users[userIndex];
        return {
            success: true,
            message: 'User updated successfully',
            user: userWithoutPassword
        };
    }

    /**
     * Update password
     */
    updatePassword(id, currentPassword, newPassword) {
        const user = this.findById(id);
        if (!user) {
            return {
                success: false,
                message: 'User not found'
            };
        }

        // Verify current password
        if (!this.verifyPassword(currentPassword, user.password)) {
            return {
                success: false,
                message: 'Current password is incorrect'
            };
        }

        // Validate new password
        if (!this.isValidPassword(newPassword)) {
            return {
                success: false,
                message: 'New password must be at least 8 characters with uppercase, lowercase, and number'
            };
        }

        // Update password
        user.password = this.hashPassword(newPassword);
        const saved = this.saveUsers();
        
        if (!saved) {
            return {
                success: false,
                message: 'Failed to update password'
            };
        }

        return {
            success: true,
            message: 'Password updated successfully'
        };
    }

    /**
     * Deactivate user
     */
    deactivate(id) {
        return this.update(id, { isActive: false });
    }

    /**
     * Activate user
     */
    activate(id) {
        return this.update(id, { isActive: true });
    }

    /**
     * Delete user
     */
    delete(id) {
        const userIndex = this.data.users.findIndex(user => user.id === id);
        if (userIndex === -1) {
            return {
                success: false,
                message: 'User not found'
            };
        }

        this.data.users.splice(userIndex, 1);
        const saved = this.saveUsers();
        
        if (!saved) {
            return {
                success: false,
                message: 'Failed to delete user'
            };
        }

        return {
            success: true,
            message: 'User deleted successfully'
        };
    }

    /**
     * Get user statistics
     */
    getStatistics() {
        const totalUsers = this.data.users.length;
        const activeUsers = this.data.users.filter(user => user.isActive).length;
        const inactiveUsers = totalUsers - activeUsers;
        const usersWithNewsletter = this.data.users.filter(user => user.newsletter).length;
        
        // Calculate users registered in last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentUsers = this.data.users.filter(user => {
            const createdAt = new Date(user.createdAt);
            return createdAt >= thirtyDaysAgo;
        }).length;

        return {
            total: totalUsers,
            active: activeUsers,
            inactive: inactiveUsers,
            newsletter: usersWithNewsletter,
            recent: recentUsers
        };
    }
}

module.exports = User;

