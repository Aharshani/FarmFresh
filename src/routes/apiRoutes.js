const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const ProductMySQL = require('../models/ProductMySQL');
const CartMySQL = require('../models/CartMySQL');
const OrderMySQL = require('../models/OrderMySQL');

// Initialize product model (MySQL)
const productModel = new ProductMySQL();

// Initialize cart model (MySQL)
const cartModel = new CartMySQL();

// Initialize order model (MySQL)
const orderModel = new OrderMySQL();

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../public/images/products');
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'product-' + uniqueSuffix + ext);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        // Check file type
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

 
//  AI ANALYSIS ROUTE (Python Integration)
 

/**
 * POST /api/analyze-quality-python
 * Analyze product quality using Python script and .h5 model
 */


router.post('/analyze-quality-python', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, error: 'No image uploaded' });
    }

    const imagePath = req.file.path;
    
    // 1. Define the absolute path to the directory containing the script
    const pythonScriptDir = path.join(__dirname, '../../ml_backend');

    // 2. Define the path to the Python script
    const pythonScriptPath = path.join(pythonScriptDir, 'predict.py');

    console.log(`Spawning  process for: ${imagePath}`);

    // Smart Command: Use 'py' on Windows, 'python3' on Mac/Linux
    const pythonCommand = process.platform === "win32" ? "py" : "python3";

    // 3. Spawn the Python process
    const pythonProcess = spawn(pythonCommand, [pythonScriptPath, imagePath]);
    
    let dataString = '';
    let errorString = '';

    // Collect data from script
    pythonProcess.stdout.on('data', (data) => {
        dataString += data.toString();
    });


    // Collect errors (filtering out common TensorFlow warnings)
    pythonProcess.stderr.on('data', (data) => {
        const msg = data.toString();
        if(!msg.includes('cpu_feature_guard') && !msg.includes('oneDNN')) {
            errorString += msg;
        }
    });

    // Handle script completion
    pythonProcess.on('close', (code) => {
        console.log(`process closed with code ${code}`);
        
        // NOTE: fs.unlink (file deletion) REMOVED so the image stays on the server!
        
        if (code !== 0) {
            console.error('Python Error:', errorString);
            // Prevent crashing if headers sent
            if (!res.headersSent) {
                return res.status(500).json({ 
                    success: false, 
                    error: 'AI analysis failed', 
                    details: errorString 
                });
            }
            return;
        }

        try {
            // Parse the JSON printed by Python
            const lines = dataString.trim().split('\n');
            const jsonLine = lines.find(line => line.trim().startsWith('{') && line.trim().endsWith('}'));
            
            if (!jsonLine) {
                throw new Error('No valid JSON output from Python script');
            }

            const result = JSON.parse(jsonLine);
            
            // Add the image URL to the result so frontend can display it
            result.imageUrl = `/images/products/${req.file.filename}`;
            
            res.json(result);

        } catch (error) {
            console.error('Parsing Error:', error, 'Raw output:', dataString);
            if (!res.headersSent) {
                res.status(500).json({ 
                    success: false, 
                    error: 'Failed to parse AI results' 
                });
            }
        }
    });
});


//  STANDARD PRODUCT ROUTES

/**
 * POST /api/products - Create a new product
 */
router.post('/products', async (req, res) => {
    try {
        const productData = req.body;
        
        // Validate required fields
        if (!productData.name || !productData.category || productData.price === undefined || productData.stock === undefined) {
            return res.status(400).json({ 
                success: false,
                error: 'Missing required fields: name, category, price, and stock are required' 
            });
        }
        
        const result = await productModel.create(productData);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.status(201).json(result);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to create product',
            message: error.message 
        });
    }
});

/**
 * GET /api/products - Get all products
 */
router.get('/products', async (req, res) => {
    try {
        const products = await productModel.getAll();
        res.json(products);
    } catch (error) {
        console.error('Error getting products:', error);
        res.status(500).json({ error: 'Failed to get products' });
    }
});

/**
 * GET /api/products/featured - Get featured products (by quality level)
 */
router.get('/products/featured', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 6;
        // Get excellent and good quality products as featured
        const excellentProducts = await productModel.getByQualityLevel('excellent');
        const goodProducts = await productModel.getByQualityLevel('good');
        const featuredProducts = [...excellentProducts, ...goodProducts]
            .sort((a, b) => b.qualityScore - a.qualityScore)
            .slice(0, limit);
        res.json(featuredProducts);
    } catch (error) {
        console.error('Error getting featured products:', error);
        res.status(500).json({ error: 'Failed to get featured products' });
    }
});

/**
 * GET /api/products/category/:category - Get products by category
 */
router.get('/products/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const products = await productModel.getByCategory(category);
        res.json(products);
    } catch (error) {
        console.error('Error getting products by category:', error);
        res.status(500).json({ error: 'Failed to get products by category' });
    }
});

/**
 * GET /api/products/search - Search products
 */
router.get('/products/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ error: 'Search query is required' });
        }
        const products = await productModel.search(q);
        res.json(products);
    } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).json({ error: 'Failed to search products' });
    }
});

/**
 * GET /api/products/:id - Get product by ID
 */
router.get('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const product = await productModel.getById(id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        console.error('Error getting product by ID:', error);
        res.status(500).json({ error: 'Failed to get product' });
    }
});

/**
 * PUT /api/products/:id - Update product
 */
router.put('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        // Validate required fields
        if (!updates || Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No updates provided' });
        }
        
        const result = await productModel.update(id, updates);
        if (!result.success) {
            return res.status(404).json(result);
        }
        
        res.json(result);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

/**
 * DELETE /api/products/:id - Delete product (Admin only)
 */
router.delete('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { email } = req.query; // Get email from query to check admin status
        
        // Check if user is admin
        if (!email) {
            return res.status(401).json({ 
                success: false,
                error: 'Authentication required. Please provide email.' 
            });
        }
        
        // Import UserMySQL to check admin status
        const UserMySQL = require('../models/UserMySQL');
        const userModel = new UserMySQL();
        const isAdmin = await userModel.isAdminByEmail(email);
        
        if (!isAdmin) {
            return res.status(403).json({ 
                success: false,
                error: 'Access denied. Admin privileges required.' 
            });
        }
        
        const result = await productModel.delete(id);
        if (!result.success) {
            return res.status(404).json(result);
        }
        
        res.json(result);
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to delete product',
            message: error.message 
        });
    }
});

/**
 * GET /api/quality/statistics - Get quality statistics
 */
router.get('/quality/statistics', async (req, res) => {
    try {
        const stats = await productModel.getStatistics();
        res.json(stats);
    } catch (error) {
        console.error('Error getting quality statistics:', error);
        res.status(500).json({ error: 'Failed to get quality statistics' });
    }
});

/**
 * GET /api/quality/insights - Get AI insights (placeholder)
 */
router.get('/quality/insights', async (req, res) => {
    try {
        const stats = await productModel.getStatistics();
        // Generate insights based on statistics
        const insights = {
            totalProducts: stats.total,
            qualityDistribution: {
                excellent: stats.excellent,
                good: stats.good,
                fair: stats.fair,
                poor: stats.poor
            },
            averageQualityScore: stats.avgQualityScore,
            stockHealth: {
                inStock: stats.inStock,
                outOfStock: stats.outOfStock
            },
            recommendations: []
        };
        res.json(insights);
    } catch (error) {
        console.error('Error getting AI insights:', error);
        res.status(500).json({ error: 'Failed to get AI insights' });
    }
});

/**
 * GET /api/quality/recommendations - Get quality recommendations
 */
router.get('/quality/recommendations', async (req, res) => {
    try {
        const stats = await productModel.getStatistics();
        const recommendations = [];
        
        if (stats.poor > stats.excellent) {
            recommendations.push('Consider improving quality assessment processes');
        }
        if (stats.outOfStock > 0) {
            recommendations.push(`Restock ${stats.outOfStock} out-of-stock products`);
        }
        if (stats.avgQualityScore < 50) {
            recommendations.push('Overall quality score is below average - review quality standards');
        }
        
        res.json(recommendations);
    } catch (error) {
        console.error('Error getting quality recommendations:', error);
        res.status(500).json({ error: 'Failed to get quality recommendations' });
    }
});

/**
 * POST /api/quality/assess - Assess product quality (Manual update)
 */
router.post('/quality/assess', async (req, res) => {
    try {
        const { productId, qualityScore, notes } = req.body;
        
        if (!productId || qualityScore === undefined) {
            return res.status(400).json({ error: 'Product ID and quality score are required' });
        }
        
        // Determine quality level based on score
        let qualityLevel = 'fair';
        if (qualityScore >= 80) qualityLevel = 'excellent';
        else if (qualityScore >= 60) qualityLevel = 'good';
        else if (qualityScore >= 40) qualityLevel = 'fair';
        else qualityLevel = 'poor';
        
        const updates = {
            qualityScore: parseInt(qualityScore),
            qualityLevel: qualityLevel,
            qualityAssessmentDate: new Date().toISOString().slice(0, 19).replace('T', ' ')
        };
        
        const result = await productModel.update(productId, updates);
        if (!result.success) {
            return res.status(404).json(result);
        }
        
        res.json(result);
    } catch (error) {
        console.error('Error assessing product quality:', error);
        res.status(500).json({ error: 'Failed to assess product quality' });
    }
});

/**
 * POST /api/upload-image - Upload product image (Standard upload)
 */
router.post('/upload-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }
        
        const productId = req.body.productId;
        if (!productId) {
            return res.status(400).json({ error: 'Product ID is required' });
        }
        
        // Generate the image URL
        const imageUrl = `/images/products/${req.file.filename}`;
        
        // Update the product with the new image URL
        const result = await productModel.update(productId, { image: imageUrl });
        if (!result.success) {
            return res.status(404).json(result);
        }
        
        res.json({
            success: true,
            imageUrl: imageUrl,
            filename: req.file.filename,
            product: result.product
        });
        
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

/**
 * Cart API Routes
 */

/**
 * GET /api/cart/:userId - Get cart items for a user
 */
router.get('/cart/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const cart = await cartModel.getCartByUserId(parseInt(userId));
        
        if (!cart.success) {
            return res.status(404).json({
                success: false,
                error: 'Cart not found'
            });
        }
        
        res.json(cart);
    } catch (error) {
        console.error('Error getting cart:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get cart'
        });
    }
});

/**
 * POST /api/cart - Add item to cart
 */
router.post('/cart', async (req, res) => {
    try {
        const cartData = req.body;
        
        // Validate required fields
        if (!cartData.userId || !cartData.productId) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: userId and productId are required'
            });
        }
        
        const result = await cartModel.addItem(cartData);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.status(201).json(result);
    } catch (error) {
        console.error('Error adding item to cart:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to add item to cart'
        });
    }
});

/**
 * PUT /api/cart/:id - Update cart item quantity
 */
router.put('/cart/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;
        
        if (quantity === undefined || quantity < 0) {
            return res.status(400).json({
                success: false,
                error: 'Quantity is required and must be >= 0'
            });
        }
        
        const result = await cartModel.updateQuantity(parseInt(id), parseInt(quantity));
        
        if (!result.success) {
            return res.status(404).json(result);
        }
        
        res.json(result);
    } catch (error) {
        console.error('Error updating cart item:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update cart item'
        });
    }
});

/**
 * DELETE /api/cart/:id - Remove item from cart
 */
router.delete('/cart/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await cartModel.removeItem(parseInt(id));
        
        if (!result.success) {
            return res.status(404).json(result);
        }
        
        res.json(result);
    } catch (error) {
        console.error('Error removing item from cart:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to remove item from cart'
        });
    }
});

/**
 * DELETE /api/cart/user/:userId - Clear cart for a user
 */
router.delete('/cart/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await cartModel.clearCart(parseInt(userId));
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.json(result);
    } catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to clear cart'
        });
    }
});

/**
 * GET /api/cart/:userId/count - Get cart item count for a user
 */
router.get('/cart/:userId/count', async (req, res) => {
    try {
        const { userId } = req.params;
        const count = await cartModel.getCartItemCount(parseInt(userId));
        
        res.json({
            success: true,
            count: count
        });
    } catch (error) {
        console.error('Error getting cart count:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get cart count'
        });
    }
});

/**
 * GET /api/cart/:userId/statistics - Get cart statistics for a user
 */
router.get('/cart/:userId/statistics', async (req, res) => {
    try {
        const { userId } = req.params;
        const statistics = await cartModel.getCartStatistics(parseInt(userId));
        
        res.json(statistics);
    } catch (error) {
        console.error('Error getting cart statistics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get cart statistics'
        });
    }
});

/**
 * POST /api/orders - Create a new order
 */
router.post('/orders', async (req, res) => {
    try {
        const orderData = req.body;

        // Validate required fields
        if (!orderData.userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        if (!orderData.items || orderData.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Order must contain at least one item'
            });
        }

        // Create order (this will also decrement stock)
        const result = await orderModel.create(orderData);

        if (!result || !result.success) {
            return res.status(500).json({
                success: false,
                message: result?.message || 'Failed to create order',
                error: result?.error || 'Unknown error'
            });
        }

        res.status(201).json(result);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create order',
            error: error.message || 'Unknown error'
        });
    }
});

/**
 * GET /api/orders/:orderId - Get order by ID
 */
router.get('/orders/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await orderModel.findByOrderId(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            order: order
        });
    } catch (error) {
        console.error('Error getting order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get order',
            error: error.message
        });
    }
});

/**
 * GET /api/orders/user/:userId - Get orders by user ID
 */
router.get('/orders/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const orders = await orderModel.getOrdersByUserId(userId);

        res.json({
            success: true,
            orders: orders
        });
    } catch (error) {
        console.error('Error getting user orders:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user orders',
            error: error.message
        });
    }
});

module.exports = router;