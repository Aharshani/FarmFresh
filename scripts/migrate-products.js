/**
 * Migration script to migrate products from JSON to MySQL
 * Run this script to migrate all products from products.json to MySQL database
 */

const fs = require('fs').promises;
const path = require('path');
const ProductMySQL = require('../src/models/ProductMySQL');
const { initializeDatabase, testConnection } = require('../src/config/database');

async function migrateProducts() {
    try {
        console.log('🚀 Starting product migration...');
        
        // Initialize database
        await initializeDatabase();
        await testConnection();
        
        // Load products from JSON
        const productsPath = path.join(__dirname, '../data/products.json');
        const data = await fs.readFile(productsPath, 'utf8');
        const products = JSON.parse(data);
        
        console.log(`📦 Found ${products.length} products to migrate`);
        
        // Initialize product model
        const productModel = new ProductMySQL();
        
        // Migrate each product
        let successCount = 0;
        let errorCount = 0;
        
        for (const product of products) {
            try {
                // Check if product already exists
                const existing = await productModel.findByProductId(product.id);
                
                if (existing) {
                    console.log(`⏭️  Product ${product.id} (${product.name}) already exists, skipping...`);
                    continue;
                }
                
                // Create product
                const result = await productModel.create(product);
                
                if (result.success) {
                    successCount++;
                    console.log(`✅ Migrated product ${product.id}: ${product.name}`);
                } else {
                    errorCount++;
                    console.error(`❌ Failed to migrate product ${product.id}: ${result.message}`);
                }
            } catch (error) {
                errorCount++;
                console.error(`❌ Error migrating product ${product.id}:`, error.message);
            }
        }
        
        console.log('\n📊 Migration Summary:');
        console.log(`   ✅ Successfully migrated: ${successCount}`);
        console.log(`   ❌ Failed: ${errorCount}`);
        console.log(`   ⏭️  Skipped (already exists): ${products.length - successCount - errorCount}`);
        console.log(`\n✅ Migration completed!`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

// Run migration
migrateProducts();


