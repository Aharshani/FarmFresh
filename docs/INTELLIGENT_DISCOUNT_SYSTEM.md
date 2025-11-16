# Intelligent Discount System

## Overview

The FarmFresh application now features an **Intelligent Discount System** that calculates unique, product-specific discounts based on multiple factors instead of generic, one-size-fits-all discounting. This system ensures that each product receives appropriate pricing based on its individual characteristics, quality, and market conditions.

## Key Features

### 🎯 **Product-Specific Discounting**
- **No more generic discounts** - Each product gets a unique discount percentage
- **Intelligent calculation** based on multiple factors
- **Dynamic pricing** that updates in real-time

### 🔍 **Multi-Factor Analysis**
The system considers these factors when calculating discounts:

1. **Expiry Urgency** - How soon the product expires
2. **Quality Score** - Current quality assessment (0-100)
3. **Stock Levels** - Current inventory availability
4. **Product Category** - Fruits, vegetables, dairy, etc.
5. **Seasonal Factors** - In-season vs. out-of-season pricing
6. **Product Characteristics** - Organic, local, demand, turnover rate

## Discount Calculation Algorithm

### Base Expiry Discount
```javascript
// Category-specific expiry sensitivity
const categorySensitivity = {
    'fruits': 1.2,      // Fruits are most sensitive to expiry
    'vegetables': 1.1,   // Vegetables are sensitive
    'dairy': 1.3,        // Dairy is very sensitive
    'meat': 1.4,         // Meat is extremely sensitive
    'grains': 0.8        // Grains are less sensitive
};

// Expiry-based discount calculation
if (daysUntilExpiry === 0) {
    baseDiscount = 70 * sensitivity;        // Expires today
} else if (daysUntilExpiry <= 1) {
    baseDiscount = 60 * sensitivity;        // Expires tomorrow
} else if (daysUntilExpiry <= 2) {
    baseDiscount = 45 * sensitivity;        // Expires in 2 days
} else if (daysUntilExpiry <= 3) {
    baseDiscount = 35 * sensitivity;        // Expires in 3 days
} else if (daysUntilExpiry <= 5) {
    baseDiscount = 25 * sensitivity;        // Expires in 4-5 days
} else if (daysUntilExpiry <= 7) {
    baseDiscount = 15 * sensitivity;        // Expires in 6-7 days
} else if (daysUntilExpiry <= 10) {
    baseDiscount = 8 * sensitivity;         // Expires in 8-10 days
} else if (daysUntilExpiry <= 14) {
    baseDiscount = 3 * sensitivity;         // Expires in 11-14 days
}
```

### Quality-Based Adjustments
```javascript
// Quality score impact varies by category
const qualityImpact = {
    'fruits': 1.5,      // Fruits quality is very important
    'vegetables': 1.3,   // Vegetables quality is important
    'dairy': 1.8,        // Dairy quality is critical
    'meat': 2.0,         // Meat quality is extremely critical
    'grains': 1.0        // Grains quality is less critical
};

if (qualityScore < 20) {
    adjustment = 25 * impact;    // Very poor quality
} else if (qualityScore < 35) {
    adjustment = 20 * impact;    // Poor quality
} else if (qualityScore < 50) {
    adjustment = 15 * impact;    // Fair quality
} else if (qualityScore < 65) {
    adjustment = 8 * impact;     // Below average quality
} else if (qualityScore < 80) {
    adjustment = 0;              // Good quality
} else {
    adjustment = -5 * impact;    // Excellent quality (premium)
}
```

### Stock-Based Adjustments
```javascript
// Stock urgency varies by category
const stockUrgency = {
    'fruits': 1.2,      // Fruits need to move quickly
    'vegetables': 1.1,   // Vegetables need to move
    'dairy': 1.4,        // Dairy needs to move very quickly
    'meat': 1.5,         // Meat needs to move extremely quickly
    'grains': 0.7        // Grains can stay longer
};

if (stock <= 2) {
    adjustment = 15 * urgency;   // Very low stock - high urgency
} else if (stock <= 5) {
    adjustment = 10 * urgency;   // Low stock - medium urgency
} else if (stock <= 10) {
    adjustment = 5 * urgency;    // Moderate stock - low urgency
} else if (stock <= 20) {
    adjustment = 0;              // Good stock - no urgency
} else {
    adjustment = 3 * urgency;    // High stock - slight discount
}
```

### Seasonal Adjustments
```javascript
// Summer fruits (June-August)
if (month >= 6 && month <= 8) {
    if (fruitName.includes('strawberry') || 
        fruitName.includes('blueberry') ||
        fruitName.includes('peach')) {
        adjustment = -5; // Slight premium for in-season fruits
    }
}

// Winter fruits (December-February)
if (month === 12 || month <= 2) {
    if (!fruitName.includes('apple') && 
        !fruitName.includes('banana') &&
        !fruitName.includes('orange')) {
        adjustment = 8; // Discount for out-of-season fruits
    }
}
```

### Product-Specific Characteristics
```javascript
// Organic certification premium reduction
if (product.certifications.includes('Organic')) {
    adjustment -= 3; // Slight reduction in discount for organic products
}

// Local certification premium reduction
if (product.certifications.includes('Local')) {
    adjustment -= 2; // Slight reduction in discount for local products
}

// High-demand product adjustments
if (product.inventoryMetrics.orderActivityScore > 80) {
    adjustment -= 5; // High-demand products get less discount
}

// Low-turnover product adjustments
if (product.inventoryMetrics.turnoverRate < 5) {
    adjustment += 8; // Low-turnover products get more discount
}

// Stock health adjustments
if (product.inventoryMetrics.stockHealthScore < 30) {
    adjustment += 10; // Poor stock health gets more discount
}
```

## Example Discount Calculations

### Example 1: Organic Strawberries (Expiring Soon, Poor Quality)
- **Product**: Organic Strawberries
- **Category**: Fruits (sensitivity: 1.2)
- **Expiry**: 2 days (base discount: 45 * 1.2 = 54%)
- **Quality**: 27/100 (adjustment: 20 * 1.5 = 30%)
- **Stock**: 1 unit (adjustment: 15 * 1.2 = 18%)
- **Organic**: Premium reduction (-3%)
- **Final Discount**: 54 + 30 + 18 - 3 = **99%** (capped at 80%)

### Example 2: Fresh Mozzarella (Expiring Soon, Poor Quality, Low Stock)
- **Product**: Fresh Mozzarella
- **Category**: Dairy (sensitivity: 1.3)
- **Expiry**: 1 day (base discount: 60 * 1.3 = 78%)
- **Quality**: 40/100 (adjustment: 15 * 1.8 = 27%)
- **Stock**: 2 units (adjustment: 15 * 1.4 = 21%)
- **Summer**: Dairy heat factor (+8%)
- **Final Discount**: 78 + 27 + 21 + 8 = **134%** (capped at 80%)

### Example 3: Organic Honey (Good Quality, Long Expiry, High Stock)
- **Product**: Organic Honey
- **Category**: Dairy (sensitivity: 1.3)
- **Expiry**: 103 days (base discount: 0%)
- **Quality**: 75/100 (adjustment: 0%)
- **Stock**: 86 units (adjustment: 3 * 1.3 = 4%)
- **Organic**: Premium reduction (-3%)
- **Final Discount**: 0 + 0 + 4 - 3 = **1%**

## Badge System

The system automatically generates appropriate badges based on discount levels:

- **🔴 Critical (60%+ OFF)**: Red badge, maximum urgency
- **🟠 High (40-59% OFF)**: Orange badge, high urgency
- **🟡 Medium (20-39% OFF)**: Yellow badge, medium urgency
- **🔵 Low (1-19% OFF)**: Blue badge, low urgency
- **🟢 Fresh (0% OFF)**: Green badge, no discount

## Badge Text Examples

- **"EXPIRED"** - Product has expired
- **"OUT OF STOCK"** - Product is unavailable
- **"EXPIRES TODAY!"** - Maximum urgency
- **"75% OFF - URGENT"** - High discount with urgency
- **"25% OFF"** - Standard discount
- **"FRESH"** - No discount needed

## Implementation Files

### Core Logic
- `public/js/products-dynamic.js` - Main discount calculation functions
- `data/products.json` - Product database with realistic expiry dates

### Key Functions
- `calculateProductSpecificDiscount()` - Main discount calculator
- `calculateExpiryBasedDiscount()` - Expiry urgency calculation
- `calculateQualityBasedAdjustment()` - Quality score adjustments
- `calculateStockBasedAdjustment()` - Stock level adjustments
- `calculateSeasonalAdjustment()` - Seasonal pricing adjustments
- `calculateProductSpecificAdjustment()` - Product characteristic adjustments

## Benefits

### 🎯 **Customer Benefits**
- **Fair pricing** based on actual product condition
- **Clear urgency indicators** for expiring products
- **Transparent discount reasons** displayed on each product

### 🏪 **Business Benefits**
- **Optimized inventory turnover** through intelligent pricing
- **Reduced waste** by encouraging quick sale of expiring items
- **Increased customer satisfaction** with fair, transparent pricing
- **Better profit margins** through strategic discounting

### 🌱 **Sustainability Benefits**
- **Reduced food waste** through strategic pricing
- **Encourages consumption** of products before expiry
- **Supports local farmers** through fair pricing strategies

## Testing

Use the built-in test function to verify the discount system:

```javascript
// In browser console
window.productsDynamicLoader.testDiscountRules();
```

This will test various product scenarios and display the calculated discounts.

## Future Enhancements

- **Machine Learning Integration** - Learn from customer behavior
- **Demand Forecasting** - Predict optimal discount timing
- **Competitive Pricing** - Market-based price adjustments
- **Customer Segmentation** - Personalized discount strategies
- **Weather Integration** - Weather-based demand adjustments

## Conclusion

The Intelligent Discount System transforms FarmFresh from a simple e-commerce platform into a sophisticated, data-driven marketplace that provides fair pricing for customers while optimizing business operations. Each product now receives personalized attention based on its unique characteristics, ensuring the best possible outcome for both customers and the business.
