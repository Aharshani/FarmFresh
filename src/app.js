/**
 * FarmFresh Application - Main MVC Application
 */
const express = require('express');
const path = require('path');
const fs = require('fs');

// Import routes
const pageRoutes = require('./routes/pageRoutes');
const apiRoutes = require('./routes/apiRoutes');

// Import middleware
const { 
    notFound, 
    errorHandler, 
    requestLogger, 
    cors, 
    bodyParser 
} = require('./middleware/errorHandler');

// Import models
const Product = require('./models/Product');
const Cart = require('./models/Cart');
const Order = require('./models/Order');

// Import services
const StorageService = require('./services/StorageService');
const ValidationService = require('./services/ValidationService');

class FarmFreshApp {
    constructor() {
        this.app = express();
        this.PORT = process.env.PORT || 3000;
        this.isInitialized = false;
        
        // Initialize services
        this.storageService = new StorageService();
        this.validationService = new ValidationService();
        
        // Initialize models
        this.productModel = new Product();
        this.cartModel = new Cart();
        this.orderModel = new Order();
    }

    /**
     * Initialize the application
     */
    init() {
        if (this.isInitialized) return;
        this.setupMiddleware();
        this.setupRoutes();
        this.isInitialized = true;
    }

    /**
     * Setup middleware
     */
    setupMiddleware() {
        this.app.use(requestLogger);
        this.app.use(cors);
        this.app.use(bodyParser);
        this.app.use(express.static(path.join(__dirname, '../public')));
    }

    /**
     * Setup routes
     */
    setupRoutes() {
        this.app.get('/favicon.ico', (req, res) => res.status(204).end());
        this.app.use('/', pageRoutes);
        this.app.use('/api', apiRoutes);
        this.app.use(notFound);
        this.app.use(errorHandler);
    }

    /**
     * Start the server
     */
    start() {
        this.init();
        this.app.listen(this.PORT, () => {
            this.logServerInfo();
        });
    } 

    /**
     * Log server information
     */
    logServerInfo() {
        console.log('\n FarmFresh MVC Application');
        console.log('==============================');
        console.log(` URL: chttp://localhost:${this.PORT}`);
        console.log(` Local farmer's market platform`);
        console.log(` Unified cart system`);
        console.log(` Supporting local farmers`);
        
        console.log('\n Available Pages:');
        this.listAvailablePages();
        
        console.log('\n API Endpoints:');
        this.listApiEndpoints();
        
        console.log('\n MVC Architecture:');
        console.log(`   • Models: Product, Cart, Order`);
        console.log(`   • Controllers: CartController, ProductController, CheckoutController`);
        console.log(`   • Services: StorageService, ValidationService`);
        console.log(`   • Routes: Page routes, API routes`);
        console.log(`   • Middleware: Error handling, CORS, Logging`);
        
        console.log('\n Happy coding! Press Ctrl+C to stop the server.\n');
    }

    /**
     * List available HTML pages
     */
    listAvailablePages() {
        const publicDir = path.join(__dirname, '../public');
        const htmlFiles = fs.readdirSync(publicDir)
            .filter(file => file.endsWith('.html'))
            .sort();
        htmlFiles.forEach(file => {
            const pageName = file.replace('.html', '');
            console.log(`   • ${pageName}.html`);
        });
    }

    /**
     * List API endpoints
     */
    listApiEndpoints() {
        console.log('   • /api/products');
        console.log('   • /api/cart');
        console.log('   • /api/orders');
    }

    /**
     * Get models
     */
    getModels() {
        return {
            product: this.productModel,
            cart: this.cartModel,
            order: this.orderModel
        };
    }
}

module.exports = FarmFreshApp; 