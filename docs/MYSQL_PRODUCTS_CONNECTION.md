# MySQL Products Connection Guide

## Overview
This document explains how the controllers, routes, and MySQL database are connected to `products.html`.

## Architecture

### 1. **Database Layer** (`src/models/ProductMySQL.js`)
- **Purpose**: Handles all MySQL database operations for products
- **Key Methods**:
  - `getAll()` - Fetch all products from MySQL
  - `getById(id)` - Fetch a single product by ID
  - `create(productData)` - Create a new product
  - `update(id, updates)` - Update an existing product
  - `delete(id)` - Delete a product
  - `getByCategory(category)` - Filter products by category
  - `getByQualityLevel(level)` - Filter products by quality
  - `search(term)` - Search products by name/description
  - `getStatistics()` - Get product statistics

### 2. **Routes Layer** (`src/routes/apiRoutes.js` and `server.js`)
- **Purpose**: Define HTTP endpoints that connect the frontend to the database
- **Key Endpoints**:
  - `GET /api/products` - Get all products
  - `GET /api/products/:id` - Get product by ID
  - `POST /api/products` - Create new product
  - `PUT /api/products/:id` - Update product
  - `DELETE /api/products/:id` - Delete product
  - `GET /api/products/category/:category` - Get products by category
  - `GET /api/products/quality/:level` - Get products by quality level
  - `GET /api/products/search?q=term` - Search products
  - `GET /api/products/statistics` - Get product statistics

### 3. **Controller Layer** (`src/controllers/ProductController.js`)
- **Purpose**: Client-side controller that manages product display and interactions
- **Key Methods**:
  - `displayProducts(containerSelector, products)` - Render products in HTML
  - `displayFeaturedProducts(containerSelector, limit)` - Show featured products
  - `displayProductsByCategory(containerSelector, category)` - Filter by category
  - `searchProducts(containerSelector, query)` - Search and display
  - `getAllProducts()` - Fetch all products from API
  - `getProductById(id)` - Fetch single product from API
  - `createProductCard(product)` - Generate HTML for product card

### 4. **Frontend** (`public/products.html`)
- **Purpose**: User interface that displays products
- **Connection**: Uses JavaScript to call API endpoints via `fetch()`

## Data Flow

```
products.html (Frontend)
    ↓
    JavaScript fetch() calls
    ↓
/api/products endpoints (Routes)
    ↓
ProductMySQL model methods
    ↓
MySQL Database (products table)
```

## Connection Details

### Frontend to API
The `products.html` page connects to MySQL through API calls:

```javascript
// Example: Fetching all products
async function loadProductsData() {
    try {
        const response = await fetch('/api/products');
        const products = await response.json();
        // Use products data...
    } catch (error) {
        console.error('Error loading products:', error);
    }
}
```

### API to Database
Routes in `server.js` and `apiRoutes.js` use `ProductMySQL` model:

```javascript
// Example: Get all products route
app.get('/api/products', async (req, res) => {
    try {
        const products = await productModel.getAll();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});
```

### Database Model
`ProductMySQL` handles database queries:

```javascript
// Example: Get all products from MySQL
async getAll() {
    const [products] = await this.pool.execute(
        'SELECT * FROM products ORDER BY lastUpdated DESC'
    );
    return products.map(product => this.parseProduct(product));
}
```

## Database Schema

The `products` table in MySQL contains:
- `id` - Auto-increment primary key
- `productId` - Unique product identifier (e.g., "product-1")
- `name` - Product name
- `category` - Product category
- `price` - Product price
- `qualityScore` - Quality score (0-100)
- `qualityLevel` - Quality level (excellent/good/fair/poor)
- `description` - Product description
- `healthBenefits` - JSON array of health benefits
- `bestUses` - JSON array of best uses
- `image` - Product image URL
- `farmer` - Farmer name
- `harvestDate` - Harvest date
- `expiryDate` - Expiry date
- `qualityAssessmentDate` - Quality assessment timestamp
- `stock` - Stock quantity
- `location` - Product location
- `certifications` - JSON array of certifications
- `inventoryMetrics` - JSON object with inventory data
- `createdAt` - Creation timestamp
- `lastUpdated` - Last update timestamp

## Usage Examples

### 1. Display All Products
```javascript
const controller = new ProductController();
await controller.displayProducts('.products-grid');
```

### 2. Search Products
```javascript
const controller = new ProductController();
await controller.searchProducts('.products-grid', 'strawberries');
```

### 3. Filter by Category
```javascript
const controller = new ProductController();
await controller.displayProductsByCategory('.products-grid', 'fruits');
```

### 4. Get Product Statistics
```javascript
const response = await fetch('/api/products/statistics');
const stats = await response.json();
console.log('Total products:', stats.total);
console.log('In stock:', stats.inStock);
```

## Migration Status

✅ **Completed**:
- ProductMySQL model created
- Database schema created
- API routes updated to use MySQL
- Products migrated from JSON to MySQL
- Frontend connected to MySQL API

## Testing

To verify the connection:

1. **Check Database**: Verify products exist in MySQL
   ```sql
   SELECT COUNT(*) FROM products;
   ```

2. **Test API**: Call the API endpoint
   ```bash
   curl http://localhost:3000/api/products
   ```

3. **Test Frontend**: Open `products.html` and check browser console for API calls

## Troubleshooting

### Products not loading
- Check MySQL connection in `src/config/database.js`
- Verify products table exists: `SHOW TABLES LIKE 'products';`
- Check API endpoint: `curl http://localhost:3000/api/products`

### API errors
- Check server logs for MySQL errors
- Verify database credentials in `src/config/database.js`
- Ensure database is initialized: `node scripts/migrate-products.js`

### Frontend errors
- Check browser console for fetch errors
- Verify API endpoint URLs match routes
- Check CORS configuration in `server.js`


