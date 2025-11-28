const { getPool } = require('../config/database');

/**
 * Product Model for FarmFresh (MySQL)
 * Handles product data management using MySQL database
 */
class ProductMySQL {
    constructor() {
        this.pool = getPool();
    }

    /**
     * Create a new product
     */
    async create(productData) {
        try {
            // Validate required fields
            const errors = this.validateProductData(productData);
            if (errors.length > 0) {
                return {
                    success: false,
                    message: 'Validation failed',
                    errors: errors
                };
            }

            // Check if product with same name already exists
            const existingProduct = await this.findByName(productData.name);
            if (existingProduct) {
                return {
                    success: false,
                    message: 'Product with this name already exists'
                };
            }

            // Prepare data for insertion
            const healthBenefits = JSON.stringify(productData.healthBenefits || []);
            const bestUses = JSON.stringify(productData.bestUses || []);
            const certifications = JSON.stringify(productData.certifications || []);
            const inventoryMetrics = JSON.stringify(productData.inventoryMetrics || {});

            // Convert ISO date strings to MySQL datetime format
            const convertToMySQLDate = (dateString) => {
                if (!dateString) return null;
                // If it's already in MySQL format (YYYY-MM-DD), return as is
                if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
                    return dateString;
                }
                // If it's an ISO datetime string, convert to MySQL format
                if (typeof dateString === 'string' && dateString.includes('T')) {
                    return new Date(dateString).toISOString().slice(0, 19).replace('T', ' ');
                }
                return dateString;
            };

            const convertToMySQLDateTime = (dateString) => {
                if (!dateString) return null;
                // If it's already in MySQL format, return as is
                if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateString)) {
                    return dateString;
                }
                // If it's an ISO datetime string, convert to MySQL format
                if (typeof dateString === 'string' && dateString.includes('T')) {
                    return new Date(dateString).toISOString().slice(0, 19).replace('T', ' ');
                }
                // If it's just a date string, convert to datetime
                if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
                    return `${dateString} 00:00:00`;
                }
                return dateString;
            };

            // Ensure all values are not undefined (convert undefined to null)
            const safeValue = (value) => (value === undefined || value === '') ? null : value;
            
            const [result] = await this.pool.execute(
                `INSERT INTO products 
                (productId, name, category, price, qualityScore, qualityLevel, description, 
                 healthBenefits, bestUses, image, farmer, harvestDate, expiryDate, 
                 qualityAssessmentDate, stock, location, certifications, inventoryMetrics) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    productData.id || productData.productId || `product-${Date.now()}`,
                    productData.name ? productData.name.trim() : null,
                    productData.category ? productData.category.trim() : null,
                    productData.price !== undefined ? parseFloat(productData.price) : 0,
                    productData.qualityScore !== undefined ? parseInt(productData.qualityScore) : 0,
                    productData.qualityLevel || 'fair',
                    productData.description || null,
                    healthBenefits,
                    bestUses,
                    productData.image || null,
                    productData.farmer || null,
                    convertToMySQLDate(productData.harvestDate),
                    convertToMySQLDate(productData.expiryDate),
                    convertToMySQLDateTime(productData.qualityAssessmentDate),
                    productData.stock !== undefined ? parseInt(productData.stock) : 0,
                    productData.location || null,
                    certifications,
                    inventoryMetrics
                ]
            );

            // Get the created product
            const product = await this.findByProductId(productData.id || productData.productId);
            
            return {
                success: true,
                message: 'Product created successfully',
                product: product
            };
        } catch (error) {
            console.error('Error creating product:', error);
            return {
                success: false,
                message: 'Failed to create product',
                error: error.message
            };
        }
    }

    /**
     * Get all products
     */
    async getAll() {
        try {
            const [products] = await this.pool.execute(
                `SELECT * FROM products ORDER BY lastUpdated DESC`
            );
            
            // Parse JSON fields
            return products.map(product => this.parseProduct(product));
        } catch (error) {
            console.error('Error getting all products:', error);
            throw error;
        }
    }

    /**
     * Get product by ID
     */
    async getById(id) {
        try {
            const product = await this.findByProductId(id);
            return product;
        } catch (error) {
            console.error('Error getting product by ID:', error);
            throw error;
        }
    }

    /**
     * Find product by productId
     */
    async findByProductId(productId) {
        try {
            const [products] = await this.pool.execute(
                'SELECT * FROM products WHERE productId = ?',
                [productId]
            );
            
            if (products.length === 0) {
                return null;
            }
            
            return this.parseProduct(products[0]);
        } catch (error) {
            console.error('Error finding product by productId:', error);
            throw error;
        }
    }

    /**
     * Find product by name
     */
    async findByName(name) {
        try {
            const [products] = await this.pool.execute(
                'SELECT * FROM products WHERE name = ?',
                [name.trim()]
            );
            
            if (products.length === 0) {
                return null;
            }
            
            return this.parseProduct(products[0]);
        } catch (error) {
            console.error('Error finding product by name:', error);
            throw error;
        }
    }

    /**
     * Update product
     */
    async update(id, updates) {
        console.log(`🔄 Model: Updating product ${id} with:`, updates);
        try {
            const product = await this.findByProductId(id);
            if (!product) {
                return {
                    success: false,
                    message: 'Product not found'
                };
            }

            // Date conversion functions
            const convertToMySQLDate = (dateString) => {
                // Handle null, undefined, or empty strings
                if (!dateString || dateString === '' || dateString === 'null' || dateString === 'undefined') {
                    return null;
                }
                // If it's already in MySQL format (YYYY-MM-DD), return as is
                if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
                    return dateString;
                }
                // If it's an ISO datetime string, convert to MySQL format
                if (typeof dateString === 'string' && dateString.includes('T')) {
                    try {
                        const date = new Date(dateString);
                        if (isNaN(date.getTime())) {
                            return null; // Invalid date
                        }
                        return dateString.split('T')[0]; // Extract just the date part
                    } catch (e) {
                        console.error('Error converting date:', dateString, e);
                        return null;
                    }
                }
                return dateString;
            };

            const convertToMySQLDateTime = (dateString) => {
                // Handle null, undefined, or empty strings
                if (!dateString || dateString === '' || dateString === 'null' || dateString === 'undefined') {
                    return null;
                }
                // If it's already in MySQL format, return as is
                if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateString)) {
                    return dateString;
                }
                // If it's an ISO datetime string, convert to MySQL format
                if (typeof dateString === 'string' && dateString.includes('T')) {
                    try {
                        const date = new Date(dateString);
                        if (isNaN(date.getTime())) {
                            return null; // Invalid date
                        }
                        return date.toISOString().slice(0, 19).replace('T', ' ');
                    } catch (e) {
                        console.error('Error converting datetime:', dateString, e);
                        return null;
                    }
                }
                // If it's just a date string, convert to datetime
                if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
                    return `${dateString} 00:00:00`;
                }
                return dateString;
            };

            // Build update query dynamically
            const allowedFields = [
                'name', 'category', 'price', 'qualityScore', 'qualityLevel', 
                'description', 'healthBenefits', 'bestUses', 'image', 'farmer',
                'harvestDate', 'expiryDate', 'qualityAssessmentDate', 'stock',
                'location', 'certifications', 'inventoryMetrics'
            ];
            
            const updateFields = [];
            const updateValues = [];

            allowedFields.forEach(field => {
                if (updates[field] !== undefined) {
                    if (['healthBenefits', 'bestUses', 'certifications', 'inventoryMetrics'].includes(field)) {
                        // JSON fields
                        updateFields.push(`${field} = ?`);
                        updateValues.push(JSON.stringify(updates[field]));
                    } else if (field === 'harvestDate' || field === 'expiryDate') {
                        // Date fields - convert to MySQL date format
                        updateFields.push(`${field} = ?`);
                        updateValues.push(convertToMySQLDate(updates[field]));
                    } else if (field === 'qualityAssessmentDate') {
                        // DateTime field - convert to MySQL datetime format
                        updateFields.push(`${field} = ?`);
                        updateValues.push(convertToMySQLDateTime(updates[field]));
                    } else {
                        updateFields.push(`${field} = ?`);
                        updateValues.push(updates[field]);
                    }
                }
            });

            if (updateFields.length === 0) {
                return {
                    success: false,
                    message: 'No valid fields to update'
                };
            }

            // Always update lastUpdated
            updateFields.push('lastUpdated = NOW()');
            updateValues.push(id);

            await this.pool.execute(
                `UPDATE products SET ${updateFields.join(', ')} WHERE productId = ?`,
                updateValues
            );

            // Get updated product
            const updatedProduct = await this.findByProductId(id);
            return {
                success: true,
                message: 'Product updated successfully',
                product: updatedProduct
            };
        } catch (error) {
            console.error('Error updating product:', error);
            return {
                success: false,
                message: 'Failed to update product',
                error: error.message
            };
        }
    }

    /**
     * Delete product
     */
    async delete(id) {
        try {
            const product = await this.findByProductId(id);
            if (!product) {
                return {
                    success: false,
                    message: 'Product not found'
                };
            }

            await this.pool.execute(
                'DELETE FROM products WHERE productId = ?',
                [id]
            );

            return {
                success: true,
                message: 'Product deleted successfully'
            };
        } catch (error) {
            console.error('Error deleting product:', error);
            return {
                success: false,
                message: 'Failed to delete product',
                error: error.message
            };
        }
    }

    /**
     * Get products by category
     */
    async getByCategory(category) {
        try {
            const [products] = await this.pool.execute(
                'SELECT * FROM products WHERE category = ? ORDER BY name',
                [category]
            );
            
            return products.map(product => this.parseProduct(product));
        } catch (error) {
            console.error('Error getting products by category:', error);
            throw error;
        }
    }

    /**
     * Get products by quality level
     */
    async getByQualityLevel(qualityLevel) {
        try {
            const [products] = await this.pool.execute(
                'SELECT * FROM products WHERE qualityLevel = ? ORDER BY qualityScore DESC',
                [qualityLevel]
            );
            
            return products.map(product => this.parseProduct(product));
        } catch (error) {
            console.error('Error getting products by quality level:', error);
            throw error;
        }
    }

    /**
     * Search products
     */
    async search(searchTerm) {
        try {
            const [products] = await this.pool.execute(
                `SELECT * FROM products 
                WHERE name LIKE ? OR description LIKE ? OR farmer LIKE ?
                ORDER BY name`,
                [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]
            );
            
            return products.map(product => this.parseProduct(product));
        } catch (error) {
            console.error('Error searching products:', error);
            throw error;
        }
    }

    /**
     * Update product stock
     */
    async updateStock(id, newStock) {
        try {
            const result = await this.update(id, { stock: parseInt(newStock) });
            return result;
        } catch (error) {
            console.error('Error updating product stock:', error);
            return {
                success: false,
                message: 'Failed to update product stock',
                error: error.message
            };
        }
    }

    /**
     * Get product statistics
     */
    async getStatistics() {
        try {
            const [stats] = await this.pool.execute(`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN stock > 0 THEN 1 ELSE 0 END) as inStock,
                    SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END) as outOfStock,
                    SUM(CASE WHEN qualityLevel = 'excellent' THEN 1 ELSE 0 END) as excellent,
                    SUM(CASE WHEN qualityLevel = 'good' THEN 1 ELSE 0 END) as good,
                    SUM(CASE WHEN qualityLevel = 'fair' THEN 1 ELSE 0 END) as fair,
                    SUM(CASE WHEN qualityLevel = 'poor' THEN 1 ELSE 0 END) as poor,
                    AVG(qualityScore) as avgQualityScore,
                    AVG(price) as avgPrice,
                    SUM(stock) as totalStock
                FROM products
            `);
            
            const result = stats[0] || {
                total: 0,
                inStock: 0,
                outOfStock: 0,
                excellent: 0,
                good: 0,
                fair: 0,
                poor: 0,
                avgQualityScore: 0,
                avgPrice: 0,
                totalStock: 0
            };
            
            // Convert string values to numbers
            return {
                total: parseInt(result.total) || 0,
                inStock: parseInt(result.inStock) || 0,
                outOfStock: parseInt(result.outOfStock) || 0,
                excellent: parseInt(result.excellent) || 0,
                good: parseInt(result.good) || 0,
                fair: parseInt(result.fair) || 0,
                poor: parseInt(result.poor) || 0,
                avgQualityScore: parseFloat(result.avgQualityScore) || 0,
                avgPrice: parseFloat(result.avgPrice) || 0,
                totalStock: parseInt(result.totalStock) || 0
            };
        } catch (error) {
            console.error('Error getting product statistics:', error);
            return {
                total: 0,
                inStock: 0,
                outOfStock: 0,
                excellent: 0,
                good: 0,
                fair: 0,
                poor: 0,
                avgQualityScore: 0,
                avgPrice: 0,
                totalStock: 0
            };
        }
    }

    /**
     * Parse product data (convert JSON strings to objects/arrays)
     */
    parseProduct(product) {
        try {
            // Helper function to safely parse JSON
            const safeParseJSON = (value, defaultValue = null) => {
                if (!value) return defaultValue;
                if (typeof value === 'string') {
                    // Check if it looks like JSON (starts with [ or {)
                    const trimmed = value.trim();
                    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
                        try {
                            return JSON.parse(value);
                        } catch (e) {
                            // If JSON parsing fails, return default
                            return defaultValue;
                        }
                    }
                    // If it's not JSON format, return default
                    return defaultValue;
                }
                if (typeof value === 'object' && value !== null) {
                    // Already an object/array
                    return value;
                }
                return defaultValue;
            };

            return {
                id: product.productId,
                productId: product.productId,
                name: product.name,
                category: product.category,
                price: parseFloat(product.price) || 0,
                qualityScore: parseInt(product.qualityScore) || 0,
                qualityLevel: product.qualityLevel,
                description: product.description || '',
                healthBenefits: safeParseJSON(product.healthBenefits, []),
                bestUses: safeParseJSON(product.bestUses, []),
                image: product.image || '',
                farmer: product.farmer || '',
                harvestDate: product.harvestDate,
                expiryDate: product.expiryDate,
                qualityAssessmentDate: product.qualityAssessmentDate,
                stock: parseInt(product.stock) || 0,
                location: product.location || '',
                certifications: safeParseJSON(product.certifications, []),
                inventoryMetrics: safeParseJSON(product.inventoryMetrics, {}),
                lastUpdated: product.lastUpdated,
                createdAt: product.createdAt
            };
        } catch (error) {
            console.error('Error parsing product:', error);
            // Return a basic product structure even if parsing fails
            return {
                id: product.productId || product.id,
                productId: product.productId || product.id,
                name: product.name || '',
                category: product.category || '',
                price: parseFloat(product.price) || 0,
                qualityScore: parseInt(product.qualityScore) || 0,
                qualityLevel: product.qualityLevel || 'fair',
                description: product.description || '',
                healthBenefits: [],
                bestUses: [],
                image: product.image || '',
                farmer: product.farmer || '',
                harvestDate: product.harvestDate,
                expiryDate: product.expiryDate,
                qualityAssessmentDate: product.qualityAssessmentDate,
                stock: parseInt(product.stock) || 0,
                location: product.location || '',
                certifications: [],
                inventoryMetrics: {},
                lastUpdated: product.lastUpdated,
                createdAt: product.createdAt
            };
        }
    }

    /**
     * Validate product data
     */
    validateProductData(productData) {
        const errors = [];

        if (!productData.name || productData.name.trim() === '') {
            errors.push('Product name is required');
        }

        if (!productData.category || productData.category.trim() === '') {
            errors.push('Product category is required');
        }

        if (productData.price === undefined || productData.price === null || isNaN(productData.price)) {
            errors.push('Product price is required and must be a number');
        }

        if (productData.stock === undefined || productData.stock === null || isNaN(productData.stock)) {
            errors.push('Product stock is required and must be a number');
        }

        return errors;
    }

    /**
     * Bulk insert products (for migration)
     */
    async bulkInsert(products) {
        try {
            const results = [];
            for (const product of products) {
                const result = await this.create(product);
                results.push(result);
            }
            return {
                success: true,
                message: `Inserted ${results.length} products`,
                results: results
            };
        } catch (error) {
            console.error('Error bulk inserting products:', error);
            return {
                success: false,
                message: 'Failed to bulk insert products',
                error: error.message
            };
        }
    }
}

module.exports = ProductMySQL;

