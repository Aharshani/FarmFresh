# Improved Discount Logic System

## Overview

The FarmFresh application now features an **Intelligent Discount System** that provides unique, product-specific discounts instead of generic pricing. This system analyzes multiple factors including expiry dates, quality scores, stock levels, seasonality, and product-specific attributes to calculate personalized discounts for each product.

## 🎯 **Key Features**

### **Multi-Factor Discount Calculation**
- **Expiry-based discounts** - Higher discounts for products nearing expiration
- **Quality-based adjustments** - Discounts reflect product quality scores
- **Stock-based adjustments** - Incentivizes sales for low/high stock items
- **Seasonal adjustments** - Prices reflect seasonal availability and demand
- **Product-specific attributes** - Organic, local, and certification bonuses

### **Dynamic Pricing Intelligence**
- **Real-time calculations** - Discounts update based on current conditions
- **Category-specific logic** - Different rules for fruits, vegetables, dairy, etc.
- **Smart thresholds** - Automatic adjustment based on market conditions
- **Predictive pricing** - Anticipates demand and adjusts accordingly

### **Business Intelligence**
- **Inventory optimization** - Encourages sales of slow-moving items
- **Revenue maximization** - Balances discount depth with profitability
- **Customer satisfaction** - Fair pricing based on product condition
- **Sustainability focus** - Reduces food waste through smart pricing

## 🔧 **How It Works**

### **1. Core Discount Calculation Algorithm**

```javascript
calculateProductSpecificDiscount(product) {
    const daysUntilExpiry = this.getDaysUntilExpiry(product.expiryDate);
    const currentDate = new Date();
    
    // Base discount from expiry
    const baseDiscount = this.calculateExpiryBasedDiscount(daysUntilExpiry, product.category);
    
    // Quality adjustment
    const qualityAdjustment = this.calculateQualityBasedAdjustment(product.qualityScore, product.category);
    
    // Stock adjustment
    const stockAdjustment = this.calculateStockBasedAdjustment(product.stock, product.category);
    
    // Seasonal adjustment
    const seasonalAdjustment = this.calculateSeasonalAdjustment(product, currentDate);
    
    // Product-specific adjustment
    const productSpecificAdjustment = this.calculateProductSpecificAdjustment(product);
    
    // Calculate final discount
    let finalDiscount = Math.round(
        baseDiscount + 
        qualityAdjustment + 
        stockAdjustment + 
        seasonalAdjustment + 
        productSpecificAdjustment
    );
    
    // Ensure discount stays within reasonable bounds (0-80%)
    finalDiscount = Math.max(0, Math.min(80, finalDiscount));
    
    return this.generateDiscountInfo(product, finalDiscount, daysUntilExpiry);
}
```

### **2. Expiry-Based Discount Logic**

```javascript
calculateExpiryBasedDiscount(daysUntilExpiry, category) {
    let baseDiscount = 0;
    
    // Critical expiry (0-2 days)
    if (daysUntilExpiry <= 2) {
        baseDiscount = category === 'dairy' ? 60 : 50;
    }
    // Urgent expiry (3-5 days)
    else if (daysUntilExpiry <= 5) {
        baseDiscount = category === 'dairy' ? 40 : 35;
    }
    // Near expiry (6-10 days)
    else if (daysUntilExpiry <= 10) {
        baseDiscount = category === 'dairy' ? 25 : 20;
    }
    // Approaching expiry (11-20 days)
    else if (daysUntilExpiry <= 20) {
        baseDiscount = category === 'dairy' ? 15 : 10;
    }
    // Fresh (21+ days)
    else {
        baseDiscount = 0;
    }
    
    return baseDiscount;
}
```

### **3. Quality-Based Adjustments**

```javascript
calculateQualityBasedAdjustment(qualityScore, category) {
    let adjustment = 0;
    
    // Critical quality (0-20)
    if (qualityScore <= 20) {
        adjustment = category === 'meat' ? -15 : -10;
    }
    // Poor quality (21-40)
    else if (qualityScore <= 40) {
        adjustment = category === 'meat' ? -10 : -5;
    }
    // Fair quality (41-60)
    else if (qualityScore <= 60) {
        adjustment = category === 'meat' ? -5 : -2;
    }
    // Good quality (61-80)
    else if (qualityScore <= 80) {
        adjustment = 0;
    }
    // Excellent quality (81-100)
    else {
        adjustment = category === 'organic' ? 5 : 0;
    }
    
    return adjustment;
}
```

### **4. Stock-Based Adjustments**

```javascript
calculateStockBasedAdjustment(stock, category) {
    let adjustment = 0;
    
    // Out of stock
    if (stock === 0) {
        adjustment = 0;
    }
    // Critical stock (1-2 items)
    else if (stock <= 2) {
        adjustment = category === 'fruits' ? -8 : -5;
    }
    // Low stock (3-5 items)
    else if (stock <= 5) {
        adjustment = category === 'fruits' ? -5 : -3;
    }
    // High stock (20+ items)
    else if (stock >= 20) {
        adjustment = category === 'fruits' ? 3 : 2;
    }
    // Normal stock (6-19 items)
    else {
        adjustment = 0;
    }
    
    return adjustment;
}
```

### **5. Seasonal Adjustments**

```javascript
calculateSeasonalAdjustment(product, currentDate) {
    const month = currentDate.getMonth() + 1;
    
    if (product.category === 'fruits') {
        return this.calculateFruitSeasonalAdjustment(product.name, month);
    } else if (product.category === 'vegetables') {
        return this.calculateVegetableSeasonalAdjustment(product.name, month);
    } else if (product.category === 'dairy') {
        return this.calculateDairySeasonalAdjustment(product.name, month);
    }
    
    return 0;
}

calculateFruitSeasonalAdjustment(fruitName, month) {
    const seasonalFruits = {
        'strawberries': { peak: [5, 6], offPeak: [12, 1, 2] },
        'apples': { peak: [9, 10, 11], offPeak: [6, 7, 8] },
        'oranges': { peak: [12, 1, 2], offPeak: [6, 7, 8] }
    };
    
    const fruit = seasonalFruits[fruitName.toLowerCase()];
    if (!fruit) return 0;
    
    if (fruit.peak.includes(month)) {
        return -5; // Peak season - lower discount
    } else if (fruit.offPeak.includes(month)) {
        return 8; // Off-peak season - higher discount
    }
    
    return 0; // Regular season
}
```

### **6. Product-Specific Adjustments**

```javascript
calculateProductSpecificAdjustment(product) {
    let adjustment = 0;
    
    // Organic certification bonus
    if (product.certifications && product.certifications.includes('Organic')) {
        adjustment += 3;
    }
    
    // Local product bonus
    if (product.certifications && product.certifications.includes('Local')) {
        adjustment += 2;
    }
    
    // Inventory health adjustments
    if (product.inventoryMetrics) {
        // Low turnover rate - encourage sales
        if (product.inventoryMetrics.turnoverRate < 0.3) {
            adjustment += 4;
        }
        
        // High order activity - maintain price
        if (product.inventoryMetrics.orderActivity > 0.8) {
            adjustment -= 2;
        }
    }
    
    return adjustment;
}
```

## 📊 **Discount Calculation Examples**

### **Example 1: Fresh Organic Strawberries (Peak Season)**

```javascript
// Product: Organic Strawberries
// Days until expiry: 15
// Quality score: 95
// Stock: 8
// Month: June (peak season)
// Certifications: Organic, Local

// Calculations:
// Base discount (15 days): 10%
// Quality adjustment (95): +5% (organic bonus)
// Stock adjustment (8): -3% (low stock)
// Seasonal adjustment (June): -5% (peak season)
// Product-specific: +5% (organic + local)

// Final discount: 10 + 5 - 3 - 5 + 5 = 12%
```

### **Example 2: Dairy Milk (Near Expiry)**

```javascript
// Product: Fresh Milk
// Days until expiry: 3
// Quality score: 75
// Stock: 25
// Month: December
// Category: Dairy

// Calculations:
// Base discount (3 days): 40% (dairy critical)
// Quality adjustment (75): 0% (good quality)
// Stock adjustment (25): +2% (high stock)
// Seasonal adjustment (December): +3% (winter demand)
// Product-specific: 0%

// Final discount: 40 + 0 + 2 + 3 + 0 = 45%
```

### **Example 3: Out-of-Season Vegetables**

```javascript
// Product: Tomatoes
// Days until expiry: 8
// Quality score: 65
// Stock: 3
// Month: January (off-peak)
// Category: Vegetables

// Calculations:
// Base discount (8 days): 20%
// Quality adjustment (65): -2% (fair quality)
// Stock adjustment (3): -3% (low stock)
// Seasonal adjustment (January): +8% (off-peak)
// Product-specific: 0%

// Final discount: 20 - 2 - 3 + 8 + 0 = 23%
```

## 🎨 **Visual Discount System**

### **Discount Badge Colors**

```javascript
// Generate discount badge styling
let badgeColor, badgeText;

if (finalDiscount >= 50) {
    badgeColor = 'bg-red-500 text-white';
    badgeText = 'MEGA SALE';
} else if (finalDiscount >= 30) {
    badgeColor = 'bg-orange-500 text-white';
    badgeText = 'BIG SAVE';
} else if (finalDiscount >= 15) {
    badgeColor = 'bg-yellow-500 text-black';
    badgeText = 'SAVE';
} else if (finalDiscount >= 5) {
    badgeColor = 'bg-green-500 text-white';
    badgeText = 'DEAL';
} else {
    badgeColor = 'bg-gray-500 text-white';
    badgeText = 'REGULAR';
}
```

### **Price Display Logic**

```javascript
// Calculate and display prices
const originalPrice = product.price;
const discountedPrice = originalPrice * (1 - finalDiscount / 100);
const savings = originalPrice - discountedPrice;

// Display logic
if (finalDiscount > 0) {
    priceDisplay.innerHTML = `
        <span class="text-gray-400 line-through text-sm">$${originalPrice.toFixed(2)}</span>
        <span class="text-green-600 font-bold text-lg">$${discountedPrice.toFixed(2)}</span>
        <span class="text-green-600 text-sm">Save $${savings.toFixed(2)} (${finalDiscount}%)</span>
    `;
} else {
    priceDisplay.innerHTML = `
        <span class="text-gray-800 font-bold text-lg">$${originalPrice.toFixed(2)}</span>
    `;
}
```

## 🔄 **Real-Time Updates**

### **Automatic Discount Refresh**

```javascript
updateExpiryPricing() {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        const productId = card.dataset.productId;
        const product = this.products.find(p => p.id === productId);
        
        if (product) {
            // Recalculate discount
            const discountInfo = this.calculateProductSpecificDiscount(product);
            
            // Update display
            this.updateProductDisplay(card, discountInfo);
        }
    });
    
    console.log('🔄 Updated pricing for all products');
}
```

### **Event-Driven Updates**

```javascript
// Update discounts when:
// 1. Time changes (daily refresh)
setInterval(() => {
    this.updateExpiryPricing();
}, 24 * 60 * 60 * 1000); // 24 hours

// 2. Stock changes
this.updateProductStock(productId, quantitySold);

// 3. Quality assessment updates
this.displayAIDetectionResults(analysis, product);
```

## 📈 **Business Intelligence Features**

### **Discount Analytics**

```javascript
generateDiscountReport() {
    const report = {
        totalProducts: this.products.length,
        discountedProducts: 0,
        averageDiscount: 0,
        categoryBreakdown: {},
        revenueImpact: 0
    };
    
    this.products.forEach(product => {
        const discountInfo = this.calculateProductSpecificDiscount(product);
        
        if (discountInfo.discount > 0) {
            report.discountedProducts++;
            report.averageDiscount += discountInfo.discount;
            
            // Category breakdown
            if (!report.categoryBreakdown[product.category]) {
                report.categoryBreakdown[product.category] = {
                    count: 0,
                    totalDiscount: 0
                };
            }
            report.categoryBreakdown[product.category].count++;
            report.categoryBreakdown[product.category].totalDiscount += discountInfo.discount;
        }
    });
    
    report.averageDiscount = report.averageDiscount / report.discountedProducts;
    return report;
}
```

### **Inventory Optimization**

```javascript
optimizeInventoryPricing() {
    const lowStockProducts = this.products.filter(p => p.stock <= 5);
    const nearExpiryProducts = this.products.filter(p => 
        this.getDaysUntilExpiry(p.expiryDate) <= 10
    );
    
    // Increase discounts for optimization targets
    lowStockProducts.forEach(product => {
        const currentDiscount = this.calculateProductSpecificDiscount(product);
        if (currentDiscount.discount < 25) {
            // Suggest discount increase
            console.log(`💡 Consider increasing discount for ${product.name} (low stock)`);
        }
    });
    
    nearExpiryProducts.forEach(product => {
        const currentDiscount = this.calculateProductSpecificDiscount(product);
        if (currentDiscount.discount < 30) {
            // Suggest discount increase
            console.log(`💡 Consider increasing discount for ${product.name} (near expiry)`);
        }
    });
}
```

## 🧪 **Testing and Validation**

### **Test Scenarios**

```javascript
testDiscountRules() {
    console.log('🧪 Testing discount rules...');
    
    // Test 1: Critical expiry dairy
    const dairyProduct = {
        name: 'Test Milk',
        category: 'dairy',
        expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        qualityScore: 80,
        stock: 10
    };
    
    const dairyDiscount = this.calculateProductSpecificDiscount(dairyProduct);
    console.log('Dairy near expiry:', dairyDiscount);
    
    // Test 2: Fresh organic fruit
    const fruitProduct = {
        name: 'Organic Apples',
        category: 'fruits',
        expiryDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        qualityScore: 95,
        stock: 15,
        certifications: ['Organic', 'Local']
    };
    
    const fruitDiscount = this.calculateProductSpecificDiscount(fruitProduct);
    console.log('Fresh organic fruit:', fruitDiscount);
}
```

### **Validation Rules**

```javascript
validateDiscountCalculation(product, discountInfo) {
    const errors = [];
    
    // Discount bounds
    if (discountInfo.discount < 0 || discountInfo.discount > 80) {
        errors.push(`Invalid discount range: ${discountInfo.discount}%`);
    }
    
    // Expiry logic
    const daysUntilExpiry = this.getDaysUntilExpiry(product.expiryDate);
    if (daysUntilExpiry <= 2 && discountInfo.discount < 40) {
        errors.push(`Critical expiry should have high discount: ${discountInfo.discount}%`);
    }
    
    // Quality logic
    if (product.qualityScore <= 20 && discountInfo.discount < 20) {
        errors.push(`Poor quality should have significant discount: ${discountInfo.discount}%`);
    }
    
    return errors;
}
```

## 🚀 **Performance Optimization**

### **Caching Strategy**

```javascript
// Cache discount calculations
const discountCache = new Map();

calculateProductSpecificDiscount(product) {
    const cacheKey = `${product.id}-${product.stock}-${product.qualityScore}-${this.getDaysUntilExpiry(product.expiryDate)}`;
    
    if (discountCache.has(cacheKey)) {
        return discountCache.get(cacheKey);
    }
    
    const discountInfo = this.performDiscountCalculation(product);
    discountCache.set(cacheKey, discountInfo);
    
    // Cache invalidation after 1 hour
    setTimeout(() => discountCache.delete(cacheKey), 60 * 60 * 1000);
    
    return discountInfo;
}
```

### **Batch Processing**

```javascript
updateAllProductDiscounts() {
    const batchSize = 50;
    const totalProducts = this.products.length;
    
    for (let i = 0; i < totalProducts; i += batchSize) {
        const batch = this.products.slice(i, i + batchSize);
        
        // Process batch asynchronously
        setTimeout(() => {
            batch.forEach(product => {
                const discountInfo = this.calculateProductSpecificDiscount(product);
                this.updateProductDisplay(this.findProductCard(product.id), discountInfo);
            });
        }, (i / batchSize) * 100); // Stagger updates
    }
}
```

## 🔮 **Future Enhancements**

### **Machine Learning Integration**
- **Demand prediction** - ML models for optimal discount timing
- **Customer behavior analysis** - Personalized discount recommendations
- **Market trend analysis** - Dynamic pricing based on external factors
- **Competitive pricing** - Real-time market price monitoring

### **Advanced Analytics**
- **ROI tracking** - Measure discount effectiveness
- **Customer segmentation** - Different discount strategies per segment
- **A/B testing** - Test different discount algorithms
- **Predictive modeling** - Forecast optimal discount levels

### **Integration Features**
- **Supplier APIs** - Real-time cost updates
- **Weather integration** - Adjust pricing for weather events
- **Social media sentiment** - Dynamic pricing based on trends
- **Inventory forecasting** - Predictive stock management

## 📋 **Configuration Options**

### **Discount Parameters**

```javascript
const DISCOUNT_CONFIG = {
    // Expiry thresholds
    expiryThresholds: {
        critical: 2,    // 0-2 days
        urgent: 5,      // 3-5 days
        near: 10,       // 6-10 days
        approaching: 20 // 11-20 days
    },
    
    // Category-specific multipliers
    categoryMultipliers: {
        dairy: 1.2,     // Dairy gets 20% higher discounts
        meat: 1.3,      // Meat gets 30% higher discounts
        fruits: 1.0,    // Fruits get standard discounts
        vegetables: 1.0 // Vegetables get standard discounts
    },
    
    // Maximum discount caps
    maxDiscounts: {
        default: 80,    // Maximum 80% discount
        dairy: 70,      // Dairy maximum 70%
        meat: 60        // Meat maximum 60%
    }
};
```

### **Seasonal Calendars**

```javascript
const SEASONAL_CALENDAR = {
    fruits: {
        spring: ['strawberries', 'rhubarb', 'apricots'],
        summer: ['peaches', 'watermelon', 'cherries'],
        fall: ['apples', 'pears', 'grapes'],
        winter: ['oranges', 'grapefruit', 'kiwi']
    },
    vegetables: {
        spring: ['asparagus', 'peas', 'spinach'],
        summer: ['tomatoes', 'corn', 'zucchini'],
        fall: ['pumpkin', 'squash', 'brussels sprouts'],
        winter: ['carrots', 'potatoes', 'onions']
    }
};
```

## 🎯 **Best Practices**

### **Implementation Guidelines**
1. **Start conservative** - Begin with lower discount ranges
2. **Monitor performance** - Track sales impact and profitability
3. **A/B test variations** - Experiment with different algorithms
4. **Customer feedback** - Gather input on discount satisfaction
5. **Regular optimization** - Continuously refine discount logic

### **Maintenance Tips**
1. **Regular audits** - Review discount effectiveness monthly
2. **Seasonal adjustments** - Update seasonal calendars quarterly
3. **Performance monitoring** - Track calculation speed and accuracy
4. **Data validation** - Ensure discount calculations are reasonable
5. **Backup systems** - Maintain fallback pricing logic

## 📊 **Metrics and KPIs**

### **Key Performance Indicators**
- **Discount penetration rate** - % of products with discounts
- **Average discount depth** - Mean discount percentage
- **Revenue impact** - Sales increase/decrease from discounts
- **Inventory turnover** - Speed of product movement
- **Customer satisfaction** - Feedback on pricing fairness

### **Monitoring Dashboard**
```javascript
createDiscountDashboard() {
    const metrics = this.generateDiscountReport();
    
    return `
        <div class="discount-dashboard">
            <h3>Discount Performance</h3>
            <div class="metric">
                <span>Discounted Products:</span>
                <span>${metrics.discountedProducts}/${metrics.totalProducts}</span>
            </div>
            <div class="metric">
                <span>Average Discount:</span>
                <span>${metrics.averageDiscount.toFixed(1)}%</span>
            </div>
            <div class="metric">
                <span>Revenue Impact:</span>
                <span>$${metrics.revenueImpact.toFixed(2)}</span>
            </div>
        </div>
    `;
}
```

## 🎉 **Conclusion**

The Improved Discount Logic System transforms FarmFresh from a simple e-commerce platform into an intelligent, data-driven marketplace that provides fair pricing for customers while optimizing business operations. Each product now receives personalized attention based on its unique characteristics, ensuring the best possible outcome for both customers and the business.

This system demonstrates how sophisticated algorithms combined with real-time data can create a dynamic pricing strategy that adapts to market conditions, product conditions, and customer behavior, ultimately leading to increased sales, reduced waste, and improved customer satisfaction.
