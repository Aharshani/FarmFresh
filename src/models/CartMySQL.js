const { getPool } = require('../config/database');
const ProductMySQL = require('./ProductMySQL');

/**
 * Cart Model for FarmFresh (MySQL)
 * Handles shopping cart data management using MySQL database
 */
class CartMySQL {
    constructor() {
        this.pool = getPool();
        this.productModel = new ProductMySQL();
    }

    /**
     * Add item to cart
     */
    async addItem(cartData) {
        try {
            // Validate required fields
            if (!cartData.userId || !cartData.productId) {
                return {
                    success: false,
                    message: 'Missing required fields: userId and productId are required'
                };
            }

            // Get product to check stock
            const product = await this.productModel.findByProductId(cartData.productId);
            if (!product) {
                return {
                    success: false,
                    message: 'Product not found'
                };
            }

            // Check if product is out of stock
            if (!product.stock || product.stock <= 0) {
                return {
                    success: false,
                    message: 'Product is out of stock'
                };
            }

            const requestedQuantity = cartData.quantity || 1;

            // Check if item already exists in cart for this user
            const existingItem = await this.getItemByUserAndProduct(cartData.userId, cartData.productId);
            
            if (existingItem) {
                // Update quantity if item already exists
                const newQuantity = (existingItem.quantity || 1) + requestedQuantity;
                return await this.updateQuantity(existingItem.id, newQuantity);
            }

            // Check if requested quantity exceeds available stock
            if (requestedQuantity > product.stock) {
                return {
                    success: false,
                    message: `Only ${product.stock} item(s) available in stock. You requested ${requestedQuantity}.`
                };
            }

            // Insert new cart item
            const [result] = await this.pool.execute(
                `INSERT INTO cart (userId, productId, quantity, createdAt, updatedAt) 
                VALUES (?, ?, ?, NOW(), NOW())`,
                [
                    cartData.userId,
                    cartData.productId,
                    requestedQuantity
                ]
            );

            // Get the created cart item
            const cartItem = await this.getItemById(result.insertId);
            
            return {
                success: true,
                message: 'Item added to cart successfully',
                cartItem: cartItem
            };
        } catch (error) {
            console.error('Error adding item to cart:', error);
            return {
                success: false,
                message: 'Failed to add item to cart',
                error: error.message
            };
        }
    }

    /**
     * Get cart items by user ID
     */
    async getCartByUserId(userId) {
        try {
            const [items] = await this.pool.execute(
                `SELECT c.*, p.name, p.price, p.image, p.category, p.stock, p.qualityScore, p.qualityLevel
                FROM cart c
                INNER JOIN products p ON c.productId = p.productId
                WHERE c.userId = ?
                ORDER BY c.createdAt DESC`,
                [userId]
            );

            // Calculate total price for each item
            const cartItems = items.map(item => ({
                id: item.id,
                userId: item.userId,
                productId: item.productId,
                quantity: item.quantity,
                name: item.name,
                price: parseFloat(item.price),
                image: item.image,
                category: item.category,
                stock: item.stock,
                qualityScore: item.qualityScore,
                qualityLevel: item.qualityLevel,
                subtotal: parseFloat(item.price) * item.quantity,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt
            }));

            // Calculate cart total
            const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
            const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

            return {
                success: true,
                items: cartItems,
                total: total,
                itemCount: itemCount
            };
        } catch (error) {
            console.error('Error getting cart by user ID:', error);
            throw error;
        }
    }

    /**
     * Get cart item by ID
     */
    async getItemById(cartItemId) {
        try {
            const [items] = await this.pool.execute(
                `SELECT c.*, p.name, p.price, p.image, p.category, p.stock
                FROM cart c
                INNER JOIN products p ON c.productId = p.productId
                WHERE c.id = ?`,
                [cartItemId]
            );

            if (items.length === 0) {
                return null;
            }

            const item = items[0];
            return {
                id: item.id,
                userId: item.userId,
                productId: item.productId,
                quantity: item.quantity,
                name: item.name,
                price: parseFloat(item.price),
                image: item.image,
                category: item.category,
                stock: item.stock,
                subtotal: parseFloat(item.price) * item.quantity,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt
            };
        } catch (error) {
            console.error('Error getting cart item by ID:', error);
            throw error;
        }
    }

    /**
     * Get cart item by user ID and product ID
     */
    async getItemByUserAndProduct(userId, productId) {
        try {
            const [items] = await this.pool.execute(
                `SELECT * FROM cart 
                WHERE userId = ? AND productId = ?`,
                [userId, productId]
            );

            if (items.length === 0) {
                return null;
            }

            return items[0];
        } catch (error) {
            console.error('Error getting cart item by user and product:', error);
            throw error;
        }
    }

    /**
     * Update cart item quantity
     */
    async updateQuantity(cartItemId, quantity) {
        try {
            if (quantity <= 0) {
                // If quantity is 0 or less, remove the item
                return await this.removeItem(cartItemId);
            }

            // Get current cart item to check product stock
            const cartItem = await this.getItemById(cartItemId);
            if (!cartItem) {
                return {
                    success: false,
                    message: 'Cart item not found'
                };
            }

            // Get product to check stock
            const product = await this.productModel.findByProductId(cartItem.productId);
            if (!product) {
                return {
                    success: false,
                    message: 'Product not found'
                };
            }

            // Check if product is out of stock
            if (!product.stock || product.stock <= 0) {
                return {
                    success: false,
                    message: 'Product is out of stock'
                };
            }

            // Check if requested quantity exceeds available stock
            if (quantity > product.stock) {
                return {
                    success: false,
                    message: `Only ${product.stock} item(s) available in stock. You requested ${quantity}.`
                };
            }

            await this.pool.execute(
                `UPDATE cart 
                SET quantity = ?, updatedAt = NOW()
                WHERE id = ?`,
                [quantity, cartItemId]
            );

            const updatedCartItem = await this.getItemById(cartItemId);
            
            return {
                success: true,
                message: 'Cart item quantity updated successfully',
                cartItem: updatedCartItem
            };
        } catch (error) {
            console.error('Error updating cart item quantity:', error);
            return {
                success: false,
                message: 'Failed to update cart item quantity',
                error: error.message
            };
        }
    }

    /**
     * Remove item from cart
     */
    async removeItem(cartItemId) {
        try {
            const [result] = await this.pool.execute(
                `DELETE FROM cart WHERE id = ?`,
                [cartItemId]
            );

            if (result.affectedRows === 0) {
                return {
                    success: false,
                    message: 'Cart item not found'
                };
            }

            return {
                success: true,
                message: 'Item removed from cart successfully'
            };
        } catch (error) {
            console.error('Error removing item from cart:', error);
            return {
                success: false,
                message: 'Failed to remove item from cart',
                error: error.message
            };
        }
    }

    /**
     * Clear cart for a user
     */
    async clearCart(userId) {
        try {
            await this.pool.execute(
                `DELETE FROM cart WHERE userId = ?`,
                [userId]
            );

            return {
                success: true,
                message: 'Cart cleared successfully'
            };
        } catch (error) {
            console.error('Error clearing cart:', error);
            return {
                success: false,
                message: 'Failed to clear cart',
                error: error.message
            };
        }
    }

    /**
     * Get cart item count for a user
     */
    async getCartItemCount(userId) {
        try {
            const [result] = await this.pool.execute(
                `SELECT SUM(quantity) as totalItems FROM cart WHERE userId = ?`,
                [userId]
            );

            return result[0]?.totalItems || 0;
        } catch (error) {
            console.error('Error getting cart item count:', error);
            return 0;
        }
    }

    /**
     * Get cart statistics for a user
     */
    async getCartStatistics(userId) {
        try {
            const cart = await this.getCartByUserId(userId);
            
            return {
                success: true,
                itemCount: cart.itemCount,
                total: cart.total,
                uniqueItemCount: cart.items.length
            };
        } catch (error) {
            console.error('Error getting cart statistics:', error);
            return {
                success: false,
                itemCount: 0,
                total: 0,
                uniqueItemCount: 0
            };
        }
    }
}

module.exports = CartMySQL;

