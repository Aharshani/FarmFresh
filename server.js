const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const UserMySQL = require('./src/models/UserMySQL');
const ProductMySQL = require('./src/models/ProductMySQL');
const { initializeDatabase, testConnection } = require('./src/config/database');
const apiRoutes = require('./src/routes/apiRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize User model (MySQL)
const userModel = new UserMySQL();

// Initialize Product model (MySQL)
const productModel = new ProductMySQL();

// Initialize database connection on startup
initializeDatabase().then(() => {
    return testConnection();
}).catch(error => {
    console.error('Failed to connect to database:', error);
    console.error('Please ensure MySQL is running and database is configured correctly.');
});

// API Routes

// Get all users (for testing)
app.get('/api/users', async (req, res) => {
    try {
        const users = await userModel.getAll();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Register new user
app.post('/api/register', async (req, res) => {
    try {
        const userData = req.body;
        
        // Use User model to create new user
        const result = await userModel.create(userData);
        
        if (result.success) {
            res.json({
                success: true,
                message: result.message,
                user: result.user
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.message,
                errors: result.errors || []
            });
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'An unexpected error occurred' 
        });
    }
});

// Login user
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Use User model to authenticate user
        const result = await userModel.authenticate(email, password);
        
        if (result.success) {
            res.json({
                success: true,
                message: result.message,
                user: result.user
            });
        } else {
            res.status(401).json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'An unexpected error occurred' 
        });
    }
});

// Get user statistics (must be before /api/users/:id to avoid route conflict)
app.get('/api/users/statistics', async (req, res) => {
    try {
        const stats = await userModel.getStatistics();
        res.json(stats);
    } catch (error) {
        console.error('Error fetching user statistics:', error);
        res.status(500).json({ 
            error: 'Failed to fetch user statistics' 
        });
    }
});

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const user = await userModel.getById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Update user role
app.put('/api/users/:id/role', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const { role } = req.body;

        if (!role || (role !== 'user' && role !== 'admin')) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid role. Must be "user" or "admin"' 
            });
        }

        const result = await userModel.updateRole(userId, role);
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error updating role:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update role' 
        });
    }
});

// Get users by role
app.get('/api/users/role/:role', async (req, res) => {
    try {
        const { role } = req.params;
        
        if (role !== 'user' && role !== 'admin') {
            return res.status(400).json({ 
                error: 'Invalid role. Must be "user" or "admin"' 
            });
        }

        const users = await userModel.getByRole(role);
        res.json(users);
    } catch (error) {
        console.error('Error fetching users by role:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Check if user is admin
app.get('/api/users/:id/is-admin', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const isAdmin = await userModel.isAdmin(userId);
        res.json({ isAdmin });
    } catch (error) {
        console.error('Error checking admin status:', error);
        res.status(500).json({ error: 'Failed to check admin status' });
    }
});

// Check current user's admin status (from session)
app.get('/api/auth/check-admin', async (req, res) => {
    try {
        // Get user ID from session token or email in request
        // For now, we'll check via email from request body or query
        const { email } = req.query;
        
        if (!email) {
            return res.status(400).json({ 
                isAdmin: false, 
                message: 'Email is required' 
            });
        }

        const isAdmin = await userModel.isAdminByEmail(email);
        res.json({ isAdmin });
    } catch (error) {
        console.error('Error checking admin status:', error);
        res.status(500).json({ 
            isAdmin: false, 
            error: 'Failed to check admin status' 
        });
    }
});

// User Management API Routes (Admin Only)

// Update user (admin only)
app.put('/api/users/:id', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const updates = req.body;
        
        const result = await userModel.update(userId, updates);
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update user' 
        });
    }
});

// Delete user (admin only)
app.delete('/api/users/:id', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        
        // Check if user exists
        const user = await userModel.getById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        // Soft delete: set isActive to false instead of deleting
        const result = await userModel.update(userId, { isActive: false });
        
        if (result.success) {
            res.json({
                success: true,
                message: 'User deactivated successfully',
                user: result.user
            });
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to delete user' 
        });
    }
});

// Activate/Deactivate user (admin only)
app.put('/api/users/:id/status', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const { isActive } = req.body;
        
        if (typeof isActive !== 'boolean') {
            return res.status(400).json({ 
                success: false, 
                message: 'isActive must be a boolean value' 
            });
        }
        
        const result = await userModel.update(userId, { isActive });
        
        if (result.success) {
            res.json({
                success: true,
                message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
                user: result.user
            });
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error updating user status:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update user status' 
        });
    }
});


// Products API endpoints - Use apiRoutes for better organization
app.use('/api', apiRoutes);

// Admin-only route for quality assessment page
// Note: Client-side protection is also implemented in the HTML file
app.get('/quality-assessment.html', (req, res) => {
    try {
        // Serve the page - client-side JavaScript will check admin status
        // In production, you should add server-side session validation here
        const filePath = path.join(__dirname, 'public', 'quality-assessment.html');
        res.sendFile(filePath);
    } catch (error) {
        console.error('Error serving quality assessment page:', error);
        res.status(500).send('Error loading page');
    }
});

// Admin Users Management Page Route
app.get('/admin-users.html', (req, res) => {
    try {
        // Serve the page - client-side JavaScript will check admin status
        // In production, you should add server-side session validation here
        const filePath = path.join(__dirname, 'public', 'admin-users.html');
        res.sendFile(filePath);
    } catch (error) {
        console.error('Error serving admin users page:', error);
        res.status(500).send('Error loading page');
    }
});

// Admin Panel Page Routes
app.get('/admin-panel', (req, res) => {
    try {
        // Serve the page - client-side JavaScript will check admin status
        // In production, you should add server-side session validation here
        const filePath = path.join(__dirname, 'public', 'admin-panel.html');
        res.sendFile(filePath);
    } catch (error) {
        console.error('Error serving admin panel page:', error);
        res.status(500).send('Error loading page');
    }
});

app.get('/admin-panel.html', (req, res) => {
    try {
        // Serve the page - client-side JavaScript will check admin status
        // In production, you should add server-side session validation here
        const filePath = path.join(__dirname, 'public', 'admin-panel.html');
        res.sendFile(filePath);
    } catch (error) {
        console.error('Error serving admin panel page:', error);
        res.status(500).send('Error loading page');
    }
});

// Profile Page Route
app.get('/profile.html', (req, res) => {
    try {
        // Serve the page - client-side JavaScript will check login status
        // In production, you should add server-side session validation here
        const filePath = path.join(__dirname, 'public', 'profile.html');
        res.sendFile(filePath);
    } catch (error) {
        console.error('Error serving profile page:', error);
        res.status(500).send('Error loading page');
    }
});

// Serve static files
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`FarmFresh server running on http://localhost:${PORT}`);
    console.log('Available endpoints:');
    console.log('  GET  /api/users - Get all users');
    console.log('  POST /api/register - Register new user');
    console.log('  POST /api/login - Login user');
    console.log('  GET  /api/users/:id - Get user by ID');
    console.log('  PUT  /api/users/:id/role - Update user role');
    console.log('  GET  /api/users/role/:role - Get users by role');
    console.log('  GET  /api/users/:id/is-admin - Check if user is admin');
    console.log('  GET  /api/auth/check-admin - Check current user admin status');
    console.log('  GET  /api/products - Get all products');
    console.log('  GET  /api/products/:id - Get product by ID');
    console.log('  POST /api/products - Create new product');
    console.log('  PUT  /api/products/:id - Update product');
    console.log('  DELETE /api/products/:id - Delete product');
    console.log('  GET  /api/products/category/:category - Get products by category');
    console.log('  GET  /api/products/quality/:level - Get products by quality level');
    console.log('  GET  /api/products/search/:term - Search products');
  console.log('  GET  /api/products/statistics - Get product statistics');
  console.log('  GET  /quality-assessment.html - Admin-only quality assessment page');
  console.log('  GET  /admin-users.html - Admin-only user management page');
  console.log('  GET  /admin-panel - Admin-only dashboard panel');
  console.log('  GET  /admin-panel.html - Admin-only dashboard panel (alternative)');
  console.log('  GET  /profile.html - User profile page');
  console.log('  GET  /api/users/statistics - Get user statistics');
  console.log('  PUT  /api/users/:id - Update user');
  console.log('  PUT  /api/users/:id/status - Activate/Deactivate user');
  console.log('  DELETE /api/users/:id - Deactivate user (soft delete)');
  console.log('  GET  /api/cart/:userId - Get cart items for a user');
  console.log('  POST /api/cart - Add item to cart');
  console.log('  PUT  /api/cart/:id - Update cart item quantity');
  console.log('  DELETE /api/cart/:id - Remove item from cart');
  console.log('  DELETE /api/cart/user/:userId - Clear cart for a user');
  console.log('  GET  /api/cart/:userId/count - Get cart item count');
  console.log('  GET  /api/cart/:userId/statistics - Get cart statistics');
});
