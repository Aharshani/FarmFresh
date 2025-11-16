const mysql = require('mysql2/promise');

/**
 * Database Configuration for FarmFresh
 */
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '0000',
    database: process.env.DB_NAME || 'farmfresh',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
};

// Create connection pool
let pool = null;

/**
 * Initialize database connection pool
 */
function createPool() {
    if (!pool) {
        pool = mysql.createPool(dbConfig);
    }
    return pool;
}

/**
 * Get database connection pool
 */
function getPool() {
    if (!pool) {
        return createPool();
    }
    return pool;
}

/**
 * Test database connection
 */
async function testConnection() {
    try {
        const connection = await getPool().getConnection();
        console.log(' Database connected successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error(' Database connection failed:', error.message);
        return false;
    }
}

/**
 * Close database connection pool
 */
async function closePool() {
    if (pool) {
        await pool.end();
        pool = null;
        console.log('Database connection pool closed');
    }
}

/**
 * Execute a query
 */
async function query(sql, params = []) {
    try {
        const [results] = await getPool().execute(sql, params);
        return results;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

/**
 * Initialize database and create tables if they don't exist
 */
async function initializeDatabase() {
    try {
        // First, create database if it doesn't exist
        const tempConfig = {
            ...dbConfig,
            database: undefined // Connect without database first
        };
        const tempPool = mysql.createPool(tempConfig);
        
        // Create database if it doesn't exist
        await tempPool.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
        console.log(` Database '${dbConfig.database}' ready`);
        
        // Close temporary pool
        await tempPool.end();
        
        // Now use the pool with database
        const pool = getPool();
        
        // Create users table
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                firstName VARCHAR(100) NOT NULL,
                lastName VARCHAR(100) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                phone VARCHAR(20) DEFAULT '',
                password VARCHAR(255) NOT NULL,
                postcode VARCHAR(20) NOT NULL,
                address VARCHAR(255) DEFAULT '',
                city VARCHAR(100) DEFAULT '',
                role ENUM('user', 'admin') DEFAULT 'user',
                termsAccepted BOOLEAN DEFAULT FALSE,
                newsletter BOOLEAN DEFAULT FALSE,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                lastLogin DATETIME NULL,
                isActive BOOLEAN DEFAULT TRUE,
                INDEX idx_email (email),
                INDEX idx_isActive (isActive),
                INDEX idx_role (role)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log(' Users table created/verified');
        
        // Add address and city columns if they don't exist (for existing tables)
        try {
            await pool.execute(`ALTER TABLE users ADD COLUMN address VARCHAR(255) DEFAULT ''`);
            console.log(' Added address column to users table');
        } catch (error) {
            if (!error.message.includes('Duplicate column name')) {
                console.warn(' Could not add address column:', error.message);
            }
        }
        
        try {
            await pool.execute(`ALTER TABLE users ADD COLUMN city VARCHAR(100) DEFAULT ''`);
            console.log(' Added city column to users table');
        } catch (error) {
            if (!error.message.includes('Duplicate column name')) {
                console.warn(' Could not add city column:', error.message);
            }
        }
        
        // Add role column if it doesn't exist (for existing tables)
        try {
            const [columns] = await pool.execute(`
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = ? 
                AND TABLE_NAME = 'users' 
                AND COLUMN_NAME = 'role'
            `, [dbConfig.database]);
            
            if (columns.length === 0) {
                await pool.execute(`
                    ALTER TABLE users 
                    ADD COLUMN role ENUM('user', 'admin') DEFAULT 'user' AFTER postcode,
                    ADD INDEX idx_role (role)
                `);
                console.log('Role column added to users table');
            }
        } catch (error) {
            // Column might already exist, ignore error
            if (!error.message.includes('Duplicate column name')) {
                console.log('  Role column check:', error.message);
            }
        }
        
        // Create products table
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                productId VARCHAR(50) NOT NULL UNIQUE,
                name VARCHAR(255) NOT NULL,
                category VARCHAR(100) NOT NULL,
                price DECIMAL(10, 2) NOT NULL DEFAULT 0,
                qualityScore INT DEFAULT 0,
                qualityLevel ENUM('excellent', 'good', 'fair', 'poor', 'critical') DEFAULT 'fair',
                description TEXT,
                healthBenefits JSON,
                bestUses JSON,
                image VARCHAR(500),
                farmer VARCHAR(255),
                harvestDate DATE,
                expiryDate DATE,
                qualityAssessmentDate DATETIME,
                stock INT DEFAULT 0,
                location VARCHAR(255),
                certifications JSON,
                inventoryMetrics JSON,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                lastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_productId (productId),
                INDEX idx_category (category),
                INDEX idx_qualityLevel (qualityLevel),
                INDEX idx_stock (stock),
                INDEX idx_name (name)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log(' Products table created/verified');
        
        // Add 'critical' to qualityLevel ENUM if it doesn't exist (for existing tables)
        try {
            await pool.execute(`
                ALTER TABLE products 
                MODIFY COLUMN qualityLevel ENUM('excellent', 'good', 'fair', 'poor', 'critical') DEFAULT 'fair'
            `);
            console.log('Updated qualityLevel ENUM to include "critical"');
        } catch (error) {
            if (!error.message.includes('Duplicate column name') && !error.message.includes('doesn\'t exist')) {
                console.warn(' Could not update qualityLevel ENUM:', error.message);
            }
        }
        
        // Create cart table
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS cart (
                id INT AUTO_INCREMENT PRIMARY KEY,
                userId INT NOT NULL,
                productId VARCHAR(255) NOT NULL,
                quantity INT NOT NULL DEFAULT 1,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (productId) REFERENCES products(productId) ON DELETE CASCADE,
                UNIQUE KEY unique_user_product (userId, productId),
                INDEX idx_userId (userId),
                INDEX idx_productId (productId)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log(' Cart table created/verified');
        
        // Create orders table
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                orderId VARCHAR(50) NOT NULL UNIQUE,
                userId INT NOT NULL,
                status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
                subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
                deliveryCost DECIMAL(10, 2) NOT NULL DEFAULT 0,
                tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
                total DECIMAL(10, 2) NOT NULL DEFAULT 0,
                deliveryMethod VARCHAR(50) DEFAULT 'pickup',
                paymentMethod VARCHAR(50) DEFAULT 'card',
                shippingAddress JSON,
                paymentInfo JSON,
                specialInstructions TEXT,
                estimatedDelivery DATE,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_orderId (orderId),
                INDEX idx_userId (userId),
                INDEX idx_status (status),
                INDEX idx_createdAt (createdAt)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log(' Orders table created/verified');
        
        // Create order_items table
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS order_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                orderId VARCHAR(50) NOT NULL,
                productId VARCHAR(255) NOT NULL,
                productName VARCHAR(255) NOT NULL,
                quantity INT NOT NULL DEFAULT 1,
                price DECIMAL(10, 2) NOT NULL DEFAULT 0,
                subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (orderId) REFERENCES orders(orderId) ON DELETE CASCADE,
                FOREIGN KEY (productId) REFERENCES products(productId) ON DELETE CASCADE,
                INDEX idx_orderId (orderId),
                INDEX idx_productId (productId)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log(' Order items table created/verified');
        
        return true;
    } catch (error) {
        console.error(' Database initialization error:', error);
        throw error;
    }
}

module.exports = {
    dbConfig,
    createPool,
    getPool,
    testConnection,
    closePool,
    query,
    initializeDatabase
};

