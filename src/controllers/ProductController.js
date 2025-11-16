/**
 * Product Controller - Handles product display and interactions
 * Updated to work with MySQL backend via API
 */
class ProductController {
    constructor() {
        this.apiBaseUrl = '/api/products';
    }

    /**
     * Display products in a container
     * @param {string} containerSelector - CSS selector for container
     * @param {Array} products - Products to display (optional, will fetch if not provided)
     * @param {boolean} isAdmin - Whether current user is admin (for delete button visibility)
     */
    async displayProducts(containerSelector, products = null, isAdmin = false) {
        const container = document.querySelector(containerSelector);
        if (!container) {
            console.error('Container not found:', containerSelector);
            return;
        }

        try {
            // Fetch products from API if not provided
            if (!products) {
                products = await this.getAllProducts();
            }
            
            if (!products || products.length === 0) {
                container.innerHTML = '<p class="text-gray-500">No products available</p>';
                return;
            }
            
            const productsHTML = products.map(product => this.createProductCard(product, isAdmin)).join('');
            container.innerHTML = productsHTML;
        } catch (error) {
            console.error('Error displaying products:', error);
            container.innerHTML = '<p class="text-red-500">Error loading products</p>';
        }
    }

    /**
     * Display featured products
     * @param {string} containerSelector - CSS selector for container
     * @param {number} limit - Number of products to show
     */
    async displayFeaturedProducts(containerSelector, limit = 6) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/featured?limit=${limit}`);
            if (!response.ok) {
                throw new Error('Failed to fetch featured products');
            }
            const featuredProducts = await response.json();
            await this.displayProducts(containerSelector, featuredProducts);
        } catch (error) {
            console.error('Error displaying featured products:', error);
        }
    }

    /**
     * Display products by category
     * @param {string} containerSelector - CSS selector for container
     * @param {string} category - Product category
     */
    async displayProductsByCategory(containerSelector, category) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/category/${category}`);
            if (!response.ok) {
                throw new Error('Failed to fetch products by category');
            }
            const categoryProducts = await response.json();
            await this.displayProducts(containerSelector, categoryProducts);
        } catch (error) {
            console.error('Error displaying products by category:', error);
        }
    }

    /**
     * Search and display products
     * @param {string} containerSelector - CSS selector for container
     * @param {string} query - Search query
     */
    async searchProducts(containerSelector, query) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/search?q=${encodeURIComponent(query)}`);
            if (!response.ok) {
                throw new Error('Failed to search products');
            }
            const searchResults = await response.json();
            await this.displayProducts(containerSelector, searchResults);
        } catch (error) {
            console.error('Error searching products:', error);
        }
    }

    /**
     * Create product card HTML
     * @param {Object} product - Product data
     * @returns {string} Product card HTML
     */
    createProductCard(product, isAdmin = false) {
        const qualityBadge = this.getQualityBadge(product.qualityLevel);
        const stockStatus = product.stock > 0 ? 'In Stock' : 'Out of Stock';
        const stockClass = product.stock > 0 ? 'text-green-600' : 'text-red-600';
        const productId = product.id || product.productId;
        
        // Delete button (only for admin) - positioned next to Add to Cart button
        const deleteButton = isAdmin ? `
            <button class="delete-product-btn bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700 transition" 
                    data-product-id="${productId}" 
                    data-product-name="${product.name}"
                    title="Delete Product">
                <i class="fas fa-trash"></i>
            </button>
        ` : '';
        
        return `
            <div class="product-card bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer border border-gray-100" data-id="${productId}" data-expiry="${product.expiryDate || ''}">
                <div class="relative">
                    <img src="${product.image || '/images/placeholder.svg'}" alt="${product.name}" class="w-full h-48 object-cover">
                    ${qualityBadge}
                    <span class="absolute top-3 right-3 bg-blue-600 text-white text-xs px-2 py-1 rounded">${product.location || 'Local'}</span>
                </div>
                <div class="p-5">
                    <h3 class="text-xl font-bold mb-1">${product.name}</h3>
                    <div class="flex items-center text-yellow-500 mb-2">
                        ${this.generateStars(product.qualityScore)}
                    </div>
                    <p class="text-green-600 font-bold text-lg mb-2">£${product.price.toFixed(2)}</p>
                    <p class="text-gray-600 text-sm mb-3"><i class="fas fa-store mr-1 text-green-600"></i> ${product.farmer || 'Local Farm'}</p>
                    <p class="text-gray-600 text-sm mb-2">${product.description || ''}</p>
                    <p class="text-sm mb-4 ${stockClass}"><i class="fas fa-box mr-1"></i> ${stockStatus} (${product.stock})</p>
                    <div class="flex justify-between items-center">
                        <div class="flex items-center space-x-2">
                            <button class="quantity-btn decrease px-2 py-1 border rounded text-gray-600 hover:bg-gray-100">-</button>
                            <span class="quantity-display px-3">1</span>
                            <button class="quantity-btn increase px-2 py-1 border rounded text-gray-600 hover:bg-gray-100">+</button>
                        </div>
                        <div class="flex items-center gap-2">
                            ${deleteButton}
                            <button class="add-to-cart bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition" ${product.stock === 0 ? 'disabled' : ''}>
                                <i class="fas fa-plus mr-1"></i>Add
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Get quality badge HTML
     */
    getQualityBadge(qualityLevel) {
        const badges = {
            excellent: '<span class="absolute top-3 left-3 bg-green-600 text-white text-xs px-2 py-1 rounded">Excellent</span>',
            good: '<span class="absolute top-3 left-3 bg-blue-600 text-white text-xs px-2 py-1 rounded">Good</span>',
            fair: '<span class="absolute top-3 left-3 bg-yellow-600 text-white text-xs px-2 py-1 rounded">Fair</span>',
            poor: '<span class="absolute top-3 left-3 bg-red-600 text-white text-xs px-2 py-1 rounded">Poor</span>'
        };
        return badges[qualityLevel] || badges.fair;
    }

    /**
     * Generate star rating HTML
     */
    generateStars(qualityScore) {
        const stars = Math.round(qualityScore / 20); // Convert 0-100 to 0-5 stars
        let html = '';
        for (let i = 0; i < 5; i++) {
            if (i < stars) {
                html += '<i class="fas fa-star"></i>';
            } else {
                html += '<i class="far fa-star"></i>';
            }
        }
        return html;
    }

    /**
     * Get product by ID
     * @param {string} id - Product ID
     * @returns {Object|null} Product or null
     */
    async getProductById(id) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/${id}`);
            if (!response.ok) {
                if (response.status === 404) {
                    return null;
                }
                throw new Error('Failed to fetch product');
            }
            return await response.json();
        } catch (error) {
            console.error('Error getting product by ID:', error);
            return null;
        }
    }

    /**
     * Get all products
     * @returns {Array} All products
     */
    async getAllProducts() {
        try {
            const response = await fetch(this.apiBaseUrl);
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            return await response.json();
        } catch (error) {
            console.error('Error getting all products:', error);
            return [];
        }
    }

    /**
     * Get products by category
     * @param {string} category - Category name
     * @returns {Array} Products in category
     */
    async getProductsByCategory(category) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/category/${category}`);
            if (!response.ok) {
                throw new Error('Failed to fetch products by category');
            }
            return await response.json();
        } catch (error) {
            console.error('Error getting products by category:', error);
            return [];
        }
    }

    /**
     * Search products
     * @param {string} query - Search query
     * @returns {Array} Search results
     */
    async searchProducts(query) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/search?q=${encodeURIComponent(query)}`);
            if (!response.ok) {
                throw new Error('Failed to search products');
            }
            return await response.json();
        } catch (error) {
            console.error('Error searching products:', error);
            return [];
        }
    }
}

module.exports = ProductController;
