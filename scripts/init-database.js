#!/usr/bin/env node

/**
 * Database Initialization Script
 * Creates the database and tables for FarmFresh
 */

const { initializeDatabase, testConnection, closePool } = require('../src/config/database');

async function main() {
    try {
        console.log(' Initializing FarmFresh database...\n');
        
        // Initialize database and create tables
        await initializeDatabase();
        
        // Test connection
        console.log('\n Testing database connection...');
        const connected = await testConnection();
        
        if (connected) {
            console.log('\n Database initialization completed successfully!');
            console.log(' Database: farmfresh');
            console.log(' Table: users (created/verified)');
        } else {
            console.log('\n Database connection test failed');
            process.exit(1);
        }
    } catch (error) {
        console.error('\n Database initialization failed:', error.message);
        process.exit(1);
    } finally {
        await closePool();
        process.exit(0);
    }
}

// Run initialization
main();

