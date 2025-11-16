# FarmFresh MVC Architecture

## Overview

FarmFresh has been restructured into a proper Model-View-Controller (MVC) pattern to improve code organization, maintainability, and scalability. This document explains the architecture and how to work with it.

## Directory Structure

```
FarmFresh/
├── src/                          # Server-side MVC structure
│   ├── models/                   # Data models
│   │   ├── Cart.js              # Cart data and operations
│   │   ├── Product.js           # Product data and operations
│   │   └── Order.js             # Order data and operations
│   ├── controllers/              # Business logic controllers
│   │   ├── CartController.js    # Cart operations and UI updates
│   │   ├── ProductController.js # Product display and interactions
│   │   └── CheckoutController.js # Checkout process and order creation
│   ├── services/                 # Utility services
│   │   ├── StorageService.js    # localStorage operations
│   │   └── ValidationService.js # Form and data validation
│   ├── routes/                   # API and page routes
│   │   ├── pageRoutes.js        # HTML page serving
│   │   └── apiRoutes.js         # API endpoints
│   ├── middleware/               # Express middleware
│   │   └── errorHandler.js      # Error handling and utilities
│   ├── config/                   # Configuration files
│   │   └── config.js            # Application settings
│   ├── app.js                    # Main application class
│   └── server.js                 # Server entry point
├── public/                       # Client-side files
│   ├── js/
│   │   └── app.js               # Client-side MVC application
│   ├── css/
│   ├── images/
│   └── *.html                   # View templates
└── docs/
    └── MVC_STRUCTURE.md         # This documentation
```

## Server-Side MVC Components

### Models (src/models/)

Models handle data and business logic:

#### Cart.js
- Manages cart items and operations
- Handles localStorage persistence
- Provides cart calculations (subtotal, total quantity)

#### Product.js
- Manages product data
- Provides search and filtering functionality
- Handles product categories and featured products

#### Order.js
- Manages order creation and storage
- Handles order calculations (tax, totals)
- Generates order numbers and IDs

### Controllers (src/controllers/)

Controllers handle business logic and coordinate between models and views:

#### CartController.js
- Manages cart UI updates
- Handles cart interactions (add, remove, update)
- Coordinates cart display and notifications

#### ProductController.js
- Manages product display
- Handles product search and filtering
- Creates product cards and manages interactions

#### CheckoutController.js
- Manages checkout process
- Handles form validation
- Coordinates order creation and confirmation

### Services (src/services/)

Services provide utility functions and cross-cutting concerns:

#### StorageService.js
- Centralized localStorage operations
- Error handling for storage operations
- Storage management utilities

#### ValidationService.js
- Form validation logic
- Data validation rules
- Validation error handling

### Routes (src/routes/)

Routes handle HTTP requests and responses:

#### pageRoutes.js
- Serves HTML pages
- Handles page routing
- Provides fallback for 404s

#### apiRoutes.js
- RESTful API endpoints
- Data operations (CRUD)
- JSON responses

### Middleware (src/middleware/)

Middleware handles cross-cutting concerns:

#### errorHandler.js
- Error handling and logging
- CORS configuration
- Request logging
- Body parsing

## Client-Side MVC Components

### Client Application (public/js/app.js)

The client-side application follows a similar MVC pattern:

#### Services
- **Storage Service**: localStorage operations
- **Validation Service**: Client-side validation
- **API Service**: HTTP requests to server

#### Controllers
- **Cart Controller**: Client-side cart management
- **Product Controller**: Product display and interactions
- **Checkout Controller**: Checkout process handling

## Configuration (src/config/)

### config.js
Centralized configuration for:
- Server settings
- Database configuration
- Cart and order settings
- Validation rules
- Feature flags

## Main Application (src/app.js)

The `FarmFreshApp` class ties everything together:
- Initializes all components
- Sets up middleware and routes
- Manages application lifecycle
- Provides server startup

## Usage Examples

### Adding a New Product

1. **Model**: Add product data to `Product.js`
```javascript
// In src/models/Product.js
getDefaultProducts() {
    return [
        // ... existing products
        {
            id: '6',
            name: 'New Product',
            price: 9.99,
            // ... other properties
        }
    ];
}
```

2. **Controller**: Update product display logic in `ProductController.js`
3. **View**: Product will automatically appear in product grids

### Adding a New API Endpoint

1. **Route**: Add endpoint to `apiRoutes.js`
```javascript
router.get('/api/new-endpoint', (req, res) => {
    // Handle request
    res.json({ success: true, data: result });
});
```

2. **Controller**: Add business logic if needed
3. **Model**: Add data operations if needed

### Adding Form Validation

1. **Service**: Add validation rules to `ValidationService.js`
```javascript
validateNewField(value) {
    return this.validationRules.newField.test(value);
}
```

2. **Controller**: Use validation in form processing
```javascript
if (!this.validationService.validateNewField(formData.newField)) {
    errors.push('Invalid field value');
}
```

## Benefits of MVC Structure

### Separation of Concerns
- **Models**: Handle data and business logic
- **Views**: Handle presentation (HTML templates)
- **Controllers**: Handle user interactions and coordination

### Maintainability
- Clear file organization
- Easy to locate and modify specific functionality
- Reduced code duplication

### Scalability
- Easy to add new features
- Modular architecture
- Clear interfaces between components

### Testability
- Isolated components
- Clear dependencies
- Easy to mock and test

## Best Practices

### Models
- Keep models focused on data operations
- Use clear, descriptive method names
- Handle errors gracefully

### Controllers
- Keep controllers thin
- Delegate business logic to models
- Handle UI updates efficiently

### Services
- Make services reusable
- Handle cross-cutting concerns
- Provide clear interfaces

### Routes
- Use RESTful conventions
- Handle errors consistently
- Validate input data

## Running the Application

1. **Start the server**:
```bash
node src/server.js
```

2. **Access the application**:
```
http://localhost:3000
```

3. **API endpoints**:
```
http://localhost:3000/api/products
http://localhost:3000/api/cart
http://localhost:3000/api/orders
```

## Development Workflow

1. **Adding features**: Start with models, then controllers, then views
2. **Debugging**: Use console logs and browser dev tools
3. **Testing**: Test individual components in isolation
4. **Deployment**: Ensure all dependencies are properly configured

## Future Enhancements

The MVC structure makes it easy to add:
- Database integration (replace localStorage)
- User authentication
- Payment processing
- Real-time updates
- Mobile app API
- Admin dashboard

This architecture provides a solid foundation for scaling the FarmFresh application while maintaining code quality and developer productivity. 