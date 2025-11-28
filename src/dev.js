#!/usr/bin/env node

/**
 * FarmFresh Application - Main MVC Application
 * This is the core application class that sets up the Express server,
 * configures middleware, routes, and manages the overall application lifecycle
 */
const express = require('express'); // Import Express.js framework for creating web server
const path = require('path'); // Import Node.js path module for file path operations
const fs = require('fs'); // Import Node.js file system module for reading directories

// Import route modules that handle different URL endpoints
const pageRoutes = require('./routes/pageRoutes'); // Routes for serving HTML pages
const apiRoutes = require('./routes/apiRoutes'); // Routes for API endpoints

// Import middleware functions for request processing and error handling
const { 
    notFound, // Middleware to handle 404 errors
    errorHandler, // Global error handling middleware
    requestLogger, // Logging middleware for all requests
    cors, // Cross-Origin Resource Sharing middleware
    bodyParser // JSON body parsing middleware
} = require('./middleware/errorHandler');

// Import data models that handle business logic and data operations
const Product = require('./models/Product'); // Product data model
const Cart = require('./models/Cart'); // Shopping cart model
const Order = require('./models/Order'); // Order management model

// Import service classes that provide utility functions
const StorageService = require('./services/StorageService'); // Data storage service
const ValidationService = require('./services/ValidationService'); // Input validation service

/**
 * Main application class that encapsulates the entire FarmFresh application
 * Implements the MVC (Model-View-Controller) pattern
 */
class FarmFreshApp {
    /**
     * Constructor initializes the Express app and core components
     */
    constructor() {
        this.app = express(); // Create new Express application instance
        this.PORT = process.env.PORT || 3000; // Set port from environment variable or default to 3000
        this.isInitialized = false; // Flag to prevent double initialization
        
        // Initialize service instances for application-wide use
        this.storageService = new StorageService(); // Create storage service instance
        this.validationService = new ValidationService(); // Create validation service instance
        
        // Initialize model instances for data management
        this.productModel = new Product(); // Create product model instance
        this.cartModel = new Cart(); // Create cart model instance
        this.orderModel = new Order(); // Create order model instance
    }

    /**
     * Initialize the application by setting up middleware and routes
     * This method ensures the app is only initialized once
     */
    init() {
        if (this.isInitialized) return; // Prevent multiple initializations
        this.setupMiddleware(); // Configure all middleware functions
        this.setupRoutes(); // Set up all route handlers
        this.isInitialized = true; // Mark as initialized
    }

    /**
     * Configure all middleware functions that process requests
     * Middleware runs in the order they are added
     */
    setupMiddleware() {
        this.app.use(requestLogger); // Log all incoming requests
        this.app.use(cors); // Enable cross-origin requests
        this.app.use(bodyParser); // Parse JSON request bodies
        this.app.use(express.static(path.join(__dirname, '../public'))); // Serve static files from public directory
    }

    /**
     * Set up all route handlers for the application
     * Routes are processed in the order they are added
     */
    setupRoutes() {
        this.app.use('/', pageRoutes); // Handle page routes (HTML files)
        this.app.use('/api', apiRoutes); // Handle API routes (JSON endpoints)
        this.app.use(notFound); // Handle 404 errors for unmatched routes
        this.app.use(errorHandler); // Handle all other errors
    }

    /**
     * Start the HTTP server and begin listening for requests
     * This is the main entry point for the application
     */
    start() {
        this.init(); // Ensure application is initialized
        this.app.listen(this.PORT, () => { // Start listening on specified port
            this.logServerInfo(); // Display server information in console
        });
    }

    /**
     * Display comprehensive server information in the console
     * Provides useful debugging and development information
     */
    logServerInfo() {
        // Display application header with emojis for visual appeal
        console.log('\n🚀 FarmFresh MVC Application');
        console.log('==============================');
        console.log(`📍 URL: http://localhost:${this.PORT}`); // Show server URL
        console.log(`📱 Local farmer's market platform`); // Application description
        console.log(`🛒 Unified cart system`); // Key feature
        console.log(`🌾 Supporting local farmers`); // Mission statement
        
        // List all available HTML pages
        console.log('\n📋 Available Pages:');
        this.listAvailablePages(); // Call method to list pages
        
        // List all API endpoints
        console.log('\n🔧 API Endpoints:');
        this.listApiEndpoints(); // Call method to list endpoints
        
        // Display MVC architecture information
        console.log('\n🎯 MVC Architecture:');
        console.log(`   • Models: Product, Cart, Order`); // Data models
        console.log(`   • Controllers: CartController, ProductController, CheckoutController`); // Business logic
        console.log(`   • Services: StorageService, ValidationService`); // Utility services
        console.log(`   • Routes: Page routes, API routes`); // URL handlers
        console.log(`   • Middleware: Error handling, CORS, Logging`); // Request processing
        
        // Display closing message
        console.log('\n✨ Happy coding! Press Ctrl+C to stop the server.\n');
    }

    /**
     * Scan the public directory and list all available HTML pages
     * This helps developers know what pages are available
     */
    listAvailablePages() {
        const publicDir = path.join(__dirname, '../public'); // Get path to public directory
        const htmlFiles = fs.readdirSync(publicDir) // Read all files in public directory
            .filter(file => file.endsWith('.html')) // Filter to only HTML files
            .sort(); // Sort alphabetically
        htmlFiles.forEach(file => { // Loop through each HTML file
            const pageName = file.replace('.html', ''); // Remove .html extension
            console.log(`   • ${pageName}.html`); // Display page name
        });
    }

    /**
     * List all available API endpoints for reference
     * This helps developers understand the API structure
     */
    listApiEndpoints() {
        console.log('   • /api/products'); // Products API endpoint
        console.log('   • /api/cart'); // Cart API endpoint
        console.log('   • /api/orders'); // Orders API endpoint
    }

    /**
     * Get access to all model instances
     * This allows other parts of the application to access the models
     * @returns {Object} Object containing all model instances
     */
    getModels() {
        return {
            product: this.productModel, // Product model instance
            cart: this.cartModel, // Cart model instance
            order: this.orderModel // Order model instance
        };
    }
}

// Export the FarmFreshApp class so it can be used in other files
module.exports = FarmFreshApp; 