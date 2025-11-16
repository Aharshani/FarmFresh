const crypto = require('crypto');
const { getPool, query } = require('../config/database');

/**
 * User Model for FarmFresh (MySQL)
 * Handles user registration, authentication, and user data management using MySQL database
 */
class UserMySQL {
    constructor() {
        this.salt = 'farmfresh_salt';
        this.pool = getPool();
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

        if (!userData.address || userData.address.trim() === '') {
            errors.push('Address is required');
        }

        if (!userData.city || userData.city.trim() === '') {
            errors.push('City is required');
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
    async findByEmail(email) {
        try {
            if (!email) return null;
            const [users] = await this.pool.execute(
                'SELECT * FROM users WHERE email = ?',
                [email.toLowerCase()]
            );
            return users.length > 0 ? users[0] : null;
        } catch (error) {
            console.error('Error finding user by email:', error);
            throw error;
        }
    }

    /**
     * Check if user exists by ID
     */
    async findById(id) {
        try {
            const [users] = await this.pool.execute(
                'SELECT * FROM users WHERE id = ?',
                [id]
            );
            return users.length > 0 ? users[0] : null;
        } catch (error) {
            console.error('Error finding user by ID:', error);
            throw error;
        }
    }

    /**
     * Create new user (register)
     */
    async create(userData) {
        try {
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
            const existingUser = await this.findByEmail(userData.email);
            if (existingUser) {
                return {
                    success: false,
                    message: 'User with this email already exists',
                    errors: ['Email already registered']
                };
            }

            // Hash password
            const hashedPassword = this.hashPassword(userData.password);

            // Set default role to 'user' (can be overridden if provided, but only by admin)
            const role = userData.role && (userData.role === 'admin' || userData.role === 'user') 
                ? userData.role 
                : 'user';

            // Insert new user
            const [result] = await this.pool.execute(
                `INSERT INTO users 
                (firstName, lastName, email, phone, password, postcode, address, city, role, termsAccepted, newsletter, isActive) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    userData.firstName.trim(),
                    userData.lastName.trim(),
                    userData.email.toLowerCase().trim(),
                    userData.phone ? userData.phone.trim() : '',
                    hashedPassword,
                    userData.postcode.trim(),
                    userData.address ? userData.address.trim() : '',
                    userData.city ? userData.city.trim() : '',
                    role,
                    userData.termsAccepted || false,
                    userData.newsletter || false,
                    true
                ]
            );

            // Get the created user
            const newUser = await this.findById(result.insertId);
            
            // Return user without password
            const { password, ...userWithoutPassword } = newUser;
            return {
                success: true,
                message: 'Registration successful! Welcome to FarmFresh!',
                user: userWithoutPassword
            };
        } catch (error) {
            console.error('Error creating user:', error);
            
            // Handle duplicate email error
            if (error.code === 'ER_DUP_ENTRY') {
                return {
                    success: false,
                    message: 'User with this email already exists',
                    errors: ['Email already registered']
                };
            }
            
            return {
                success: false,
                message: 'Failed to create user account',
                errors: ['Database error']
            };
        }
    }

    /**
     * Authenticate user (login)
     */
    async authenticate(email, password) {
        try {
            if (!email || !password) {
                return {
                    success: false,
                    message: 'Email and password are required',
                    user: null
                };
            }

            const user = await this.findByEmail(email);
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
            await this.pool.execute(
                'UPDATE users SET lastLogin = NOW() WHERE id = ?',
                [user.id]
            );

            // Get updated user
            const updatedUser = await this.findById(user.id);

            // Return user without password
            const { password: _, ...userWithoutPassword } = updatedUser;
            return {
                success: true,
                message: 'Login successful!',
                user: userWithoutPassword
            };
        } catch (error) {
            console.error('Error authenticating user:', error);
            return {
                success: false,
                message: 'An error occurred during authentication',
                user: null
            };
        }
    }

    /**
     * Get all users (without passwords)
     */
    async getAll() {
        try {
            const [users] = await this.pool.execute(
                'SELECT id, firstName, lastName, email, phone, postcode, address, city, role, termsAccepted, newsletter, createdAt, lastLogin, isActive FROM users'
            );
            return users;
        } catch (error) {
            console.error('Error getting all users:', error);
            throw error;
        }
    }

    /**
     * Get user by ID (without password)
     */
    async getById(id) {
        try {
            const [users] = await this.pool.execute(
                'SELECT id, firstName, lastName, email, phone, postcode, address, city, role, termsAccepted, newsletter, createdAt, lastLogin, isActive FROM users WHERE id = ?',
                [id]
            );
            return users.length > 0 ? users[0] : null;
        } catch (error) {
            console.error('Error getting user by ID:', error);
            throw error;
        }
    }

    /**
     * Update user
     */
    async update(id, updates) {
        try {
            const user = await this.findById(id);
            if (!user) {
                return {
                    success: false,
                    message: 'User not found'
                };
            }

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

            // Build update query dynamically
            const allowedFields = ['firstName', 'lastName', 'phone', 'postcode', 'address', 'city', 'role', 'newsletter', 'isActive'];
            const updateFields = [];
            const updateValues = [];

            allowedFields.forEach(field => {
                if (updates[field] !== undefined) {
                    // Validate role if being updated
                    if (field === 'role' && updates[field] !== 'user' && updates[field] !== 'admin') {
                        return; // Skip invalid role
                    }
                    updateFields.push(`${field} = ?`);
                    updateValues.push(updates[field]);
                }
            });

            if (updateFields.length === 0) {
                return {
                    success: false,
                    message: 'No valid fields to update'
                };
            }

            updateValues.push(id);

            await this.pool.execute(
                `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
                updateValues
            );

            // Get updated user
            const updatedUser = await this.getById(id);
            return {
                success: true,
                message: 'User updated successfully',
                user: updatedUser
            };
        } catch (error) {
            console.error('Error updating user:', error);
            return {
                success: false,
                message: 'Failed to update user'
            };
        }
    }

    /**
     * Update password
     */
    async updatePassword(id, currentPassword, newPassword) {
        try {
            const user = await this.findById(id);
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
            const hashedPassword = this.hashPassword(newPassword);
            await this.pool.execute(
                'UPDATE users SET password = ? WHERE id = ?',
                [hashedPassword, id]
            );

            return {
                success: true,
                message: 'Password updated successfully'
            };
        } catch (error) {
            console.error('Error updating password:', error);
            return {
                success: false,
                message: 'Failed to update password'
            };
        }
    }

    /**
     * Deactivate user
     */
    async deactivate(id) {
        return this.update(id, { isActive: false });
    }

    /**
     * Activate user
     */
    async activate(id) {
        return this.update(id, { isActive: true });
    }

    /**
     * Delete user
     */
    async delete(id) {
        try {
            const [result] = await this.pool.execute(
                'DELETE FROM users WHERE id = ?',
                [id]
            );

            if (result.affectedRows === 0) {
                return {
                    success: false,
                    message: 'User not found'
                };
            }

            return {
                success: true,
                message: 'User deleted successfully'
            };
        } catch (error) {
            console.error('Error deleting user:', error);
            return {
                success: false,
                message: 'Failed to delete user'
            };
        }
    }

    /**
     * Check if user is admin
     */
    async isAdmin(userId) {
        try {
            const user = await this.findById(userId);
            return user && user.role === 'admin';
        } catch (error) {
            console.error('Error checking admin status:', error);
            return false;
        }
    }

    /**
     * Check if user is admin by email
     */
    async isAdminByEmail(email) {
        try {
            const user = await this.findByEmail(email);
            return user && user.role === 'admin';
        } catch (error) {
            console.error('Error checking admin status:', error);
            return false;
        }
    }

    /**
     * Update user role
     */
    async updateRole(id, newRole) {
        try {
            // Validate role
            if (newRole !== 'user' && newRole !== 'admin') {
                return {
                    success: false,
                    message: 'Invalid role. Must be "user" or "admin"'
                };
            }

            const user = await this.findById(id);
            if (!user) {
                return {
                    success: false,
                    message: 'User not found'
                };
            }

            await this.pool.execute(
                'UPDATE users SET role = ? WHERE id = ?',
                [newRole, id]
            );

            const updatedUser = await this.getById(id);
            return {
                success: true,
                message: `User role updated to ${newRole}`,
                user: updatedUser
            };
        } catch (error) {
            console.error('Error updating role:', error);
            return {
                success: false,
                message: 'Failed to update role'
            };
        }
    }

    /**
     * Get users by role
     */
    async getByRole(role) {
        try {
            if (role !== 'user' && role !== 'admin') {
                return [];
            }

            const [users] = await this.pool.execute(
                'SELECT id, firstName, lastName, email, phone, postcode, address, city, role, termsAccepted, newsletter, createdAt, lastLogin, isActive FROM users WHERE role = ?',
                [role]
            );
            return users;
        } catch (error) {
            console.error('Error getting users by role:', error);
            throw error;
        }
    }

    /**
     * Get user statistics
     */
    async getStatistics() {
        try {
            const [stats] = await this.pool.execute(`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN isActive = 1 THEN 1 ELSE 0 END) as active,
                    SUM(CASE WHEN isActive = 0 THEN 1 ELSE 0 END) as inactive,
                    SUM(CASE WHEN newsletter = 1 THEN 1 ELSE 0 END) as newsletter,
                    SUM(CASE WHEN createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as recent,
                    SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admins,
                    SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) as users
                FROM users
            `);
            
            const result = stats[0] || {
                total: 0,
                active: 0,
                inactive: 0,
                newsletter: 0,
                recent: 0,
                admins: 0,
                users: 0
            };
            
            // Convert string values to numbers (MySQL returns SUM/COUNT as strings)
            return {
                total: parseInt(result.total) || 0,
                active: parseInt(result.active) || 0,
                inactive: parseInt(result.inactive) || 0,
                newsletter: parseInt(result.newsletter) || 0,
                recent: parseInt(result.recent) || 0,
                admins: parseInt(result.admins) || 0,
                users: parseInt(result.users) || 0
            };
        } catch (error) {
            console.error('Error getting statistics:', error);
            return {
                total: 0,
                active: 0,
                inactive: 0,
                newsletter: 0,
                recent: 0,
                admins: 0,
                users: 0
            };
        }
    }
}

module.exports = UserMySQL;

