const { getPool } = require('../config/database');
const ProductMySQL = require('./ProductMySQL');

/**
 * Order Model for FarmFresh (MySQL)
 * Handles order data management using MySQL database
 */
class OrderMySQL {
    constructor() {
        this.pool = getPool();
        this.productModel = new ProductMySQL();
    }

    /**
     * Create a new order
     */
    async create(orderData) {
        const connection = await this.pool.getConnection();
        try {
            await connection.beginTransaction();

            // Generate unique order ID
            const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            // Convert estimatedDelivery to MySQL date format if provided
            let estimatedDeliveryDate = null;
            if (orderData.estimatedDelivery) {
                try {
                    // If it's a date string, parse it
                    const date = new Date(orderData.estimatedDelivery);
                    if (!isNaN(date.getTime())) {
                        estimatedDeliveryDate = date.toISOString().split('T')[0]; // YYYY-MM-DD format
                    } else {
                        // Try to parse formatted date string (e.g., "Monday, 15 January 2024")
                        const parsed = new Date(orderData.estimatedDelivery);
                        if (!isNaN(parsed.getTime())) {
                            estimatedDeliveryDate = parsed.toISOString().split('T')[0];
                        }
                    }
                } catch (e) {
                    console.warn('Invalid estimatedDelivery date:', orderData.estimatedDelivery);
                }
            }

            // Insert order
            const [orderResult] = await connection.execute(
                `INSERT INTO orders 
                (orderId, userId, status, subtotal, deliveryCost, tax, total, 
                 deliveryMethod, paymentMethod, shippingAddress, paymentInfo, 
                 specialInstructions, estimatedDelivery) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    orderId,
                    orderData.userId,
                    'pending',
                    parseFloat(orderData.subtotal) || 0,
                    parseFloat(orderData.deliveryCost) || 0,
                    parseFloat(orderData.tax) || 0,
                    parseFloat(orderData.total) || 0,
                    orderData.delivery || 'pickup',
                    orderData.payment?.method || 'card',
                    JSON.stringify(orderData.shipping || {}),
                    JSON.stringify(orderData.payment || {}),
                    orderData.specialInstructions || null,
                    estimatedDeliveryDate
                ]
            );

            // Insert order items and decrement stock
            for (const item of orderData.items || []) {
                // Insert order item
                await connection.execute(
                    `INSERT INTO order_items 
                    (orderId, productId, productName, quantity, price, subtotal) 
                    VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        orderId,
                        item.productId || item.id,
                        item.name || 'Product',
                        parseInt(item.quantity) || 1,
                        parseFloat(item.price) || 0,
                        parseFloat(item.subtotal) || (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1)
                    ]
                );

                // Decrement product stock
                const product = await this.productModel.findByProductId(item.productId || item.id);
                if (product) {
                    const newStock = Math.max(0, (product.stock || 0) - (parseInt(item.quantity) || 1));
                    await connection.execute(
                        `UPDATE products 
                        SET stock = ?, lastUpdated = NOW() 
                        WHERE productId = ?`,
                        [newStock, item.productId || item.id]
                    );
                    console.log(`✅ Stock updated for product ${item.productId || item.id}: ${product.stock} -> ${newStock}`);
                } else {
                    console.warn(`⚠️ Product not found: ${item.productId || item.id}`);
                }
            }

            await connection.commit();

            // Get the created order (use a new connection since transaction is committed)
            const order = await this.findByOrderId(orderId);

            return {
                success: true,
                message: 'Order created successfully',
                orderId: orderId,
                order: order || { orderId: orderId } // Return order or at least orderId
            };
        } catch (error) {
            await connection.rollback();
            console.error('Error creating order:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Find order by orderId
     */
    async findByOrderId(orderId) {
        try {
            const [orders] = await this.pool.execute(
                `SELECT * FROM orders WHERE orderId = ?`,
                [orderId]
            );

            if (orders.length === 0) {
                return null;
            }

            const order = orders[0];

            // Get order items
            const [items] = await this.pool.execute(
                `SELECT * FROM order_items WHERE orderId = ?`,
                [orderId]
            );

            order.items = items;

            // Parse JSON fields
            if (order.shippingAddress) {
                try {
                    order.shippingAddress = typeof order.shippingAddress === 'string' 
                        ? JSON.parse(order.shippingAddress) 
                        : order.shippingAddress;
                } catch (e) {
                    order.shippingAddress = {};
                }
            }

            if (order.paymentInfo) {
                try {
                    order.paymentInfo = typeof order.paymentInfo === 'string' 
                        ? JSON.parse(order.paymentInfo) 
                        : order.paymentInfo;
                } catch (e) {
                    order.paymentInfo = {};
                }
            }

            return order;
        } catch (error) {
            console.error('Error finding order:', error);
            throw error;
        }
    }

    /**
     * Get orders by userId
     */
    async getOrdersByUserId(userId) {
        try {
            const [orders] = await this.pool.execute(
                `SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC`,
                [userId]
            );

            // Get items for each order
            for (const order of orders) {
                const [items] = await this.pool.execute(
                    `SELECT * FROM order_items WHERE orderId = ?`,
                    [order.orderId]
                );
                order.items = items;

                // Parse JSON fields
                if (order.shippingAddress) {
                    try {
                        order.shippingAddress = typeof order.shippingAddress === 'string' 
                            ? JSON.parse(order.shippingAddress) 
                            : order.shippingAddress;
                    } catch (e) {
                        order.shippingAddress = {};
                    }
                }

                if (order.paymentInfo) {
                    try {
                        order.paymentInfo = typeof order.paymentInfo === 'string' 
                            ? JSON.parse(order.paymentInfo) 
                            : order.paymentInfo;
                    } catch (e) {
                        order.paymentInfo = {};
                    }
                }
            }

            return orders;
        } catch (error) {
            console.error('Error getting orders by userId:', error);
            throw error;
        }
    }

    /**
     * Update order status
     */
    async updateStatus(orderId, status) {
        try {
            await this.pool.execute(
                `UPDATE orders SET status = ?, updatedAt = NOW() WHERE orderId = ?`,
                [status, orderId]
            );

            return {
                success: true,
                message: 'Order status updated successfully'
            };
        } catch (error) {
            console.error('Error updating order status:', error);
            throw error;
        }
    }
}

module.exports = OrderMySQL;

