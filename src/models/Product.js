const fs = require('fs');
const path = require('path');

class Product {
    constructor() {
        this.dataFile = path.join(__dirname, '../../data/products.json');
        this.products = this.loadProducts();
    }

    /**
     * Load products from JSON file
     */
    loadProducts() {
        try {
            if (fs.existsSync(this.dataFile)) {
                const data = fs.readFileSync(this.dataFile, 'utf8');
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('Error loading products:', error);
        }
        return this.generateDefaultProducts();
    }

    /**
     * Save products to JSON file
     */
    saveProducts() {
        try {
            const dir = path.dirname(this.dataFile);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(this.dataFile, JSON.stringify(this.products, null, 2));
            return true;
        } catch (error) {
            console.error('Error saving products:', error);
            return false;
        }
    }

    /**
     * Generate default products for demonstration
     */
    generateDefaultProducts() {
        const productList = [
            {
                name: "Organic Strawberries",
                category: "fruits",
                price: 4.99,
                description: "Sweet, juicy strawberries picked fresh this morning. Perfect for desserts or snacking.",
                farmer: "Green Valley Farms",
                image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&h=300&fit=crop&crop=center"
            },
            {
                name: "Heirloom Cherry Tomatoes",
                category: "vegetables",
                price: 3.99,
                description: "Bursting with flavor, these heirloom cherry tomatoes are perfect for salads and snacking.",
                farmer: "Sunset Organics",
                image: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&h=300&fit=crop&crop=center"
            },
            {
                name: "Mixed Salad Greens",
                category: "vegetables",
                price: 2.99,
                description: "A perfect blend of kale, arugula, and spinach for your healthy salads.",
                farmer: "Morning Dew Farm",
                image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop&crop=center"
            },
            {
                name: "Free-Range Eggs",
                category: "dairy",
                price: 5.99,
                description: "Fresh eggs from happy, free-range chickens. Rich yolks and perfect for baking.",
                farmer: "Happy Hen Farm",
                image: "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=400&h=300&fit=crop&crop=center"
            },
            {
                name: "Fresh Basil",
                category: "vegetables",
                price: 2.49,
                description: "Aromatic fresh basil perfect for Italian dishes and pesto.",
                farmer: "Herb Garden Co.",
                image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop&crop=center"
            },
            {
                name: "Organic Honey",
                category: "dairy",
                price: 8.99,
                description: "Pure, raw honey from local beehives. Sweet and natural.",
                farmer: "Bee Happy Apiary",
                image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=300&fit=crop&crop=center"
            },
            {
                name: "Fresh Mozzarella",
                category: "dairy",
                price: 6.99,
                description: "Creamy, fresh mozzarella made from local cow's milk.",
                farmer: "Dairy Delights",
                image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&crop=center"
            },
            {
                name: "Organic Carrots",
                category: "vegetables",
                price: 2.50,
                description: "Sweet and crunchy organic carrots perfect for snacking or cooking.",
                farmer: "Root Valley Farm",
                image: "https://images.unsplash.com/photo-1447175008436-1701707538865?w=400&h=300&fit=crop&crop=center"
            },
            {
                name: "Fresh Asparagus",
                category: "vegetables",
                price: 4.50,
                description: "Tender, fresh asparagus spears perfect for grilling or steaming.",
                farmer: "Green Valley Farms",
                image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop&crop=center"
            },
            {
                name: "Fresh Mushrooms",
                category: "vegetables",
                price: 3.75,
                description: "Fresh, locally grown mushrooms perfect for cooking.",
                farmer: "Fungi Farm",
                image: "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=400&h=300&fit=crop&crop=center"
            },
            {
                name: "Organic Apples",
                category: "fruits",
                price: 3.25,
                description: "Crisp, sweet organic apples from local orchards.",
                farmer: "Apple Valley Orchard",
                image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=300&fit=crop&crop=center"
            },
            {
                name: "Fresh Bananas",
                category: "fruits",
                price: 1.99,
                description: "Sweet, ripe bananas perfect for smoothies or snacking.",
                farmer: "Tropical Fruits Co.",
                image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop&crop=center"
            },
            {
                name: "Organic Spinach",
                category: "vegetables",
                price: 2.75,
                description: "Fresh, organic spinach packed with nutrients.",
                farmer: "Green Leaf Farm",
                image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=300&fit=crop&crop=center"
            },
            {
                name: "Fresh Broccoli",
                category: "vegetables",
                price: 3.50,
                description: "Crisp, fresh broccoli perfect for steaming or stir-frying.",
                farmer: "Veggie Valley",
                image: "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&h=300&fit=crop&crop=center"
            },
            {
                name: "Organic Blueberries",
                category: "fruits",
                price: 5.99,
                description: "Sweet, antioxidant-rich blueberries from local farms.",
                farmer: "Berry Best Farm",
                image: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=400&h=300&fit=crop&crop=center"
            },
            {
                name: "Fresh Garlic",
                category: "vegetables",
                price: 1.99,
                description: "Aromatic fresh garlic for all your cooking needs.",
                farmer: "Garlic Grove",
                image: "https://images.unsplash.com/photo-1556801712-76c8eb07bbc9?w=400&h=300&fit=crop&crop=center"
            },
            {
                name: "Organic Onions",
                category: "vegetables",
                price: 2.25,
                description: "Sweet, organic onions perfect for cooking.",
                farmer: "Onion Valley Farm",
                image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=300&fit=crop&crop=center"
            },
            {
                name: "Fresh Potatoes",
                category: "vegetables",
                price: 2.99,
                description: "Fresh, local potatoes perfect for any dish.",
                farmer: "Spud Farm",
                image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=300&fit=crop&crop=center"
            },
            {
                name: "Organic Cucumbers",
                category: "vegetables",
                price: 2.75,
                description: "Crisp, refreshing cucumbers perfect for salads.",
                farmer: "Cucumber Corner",
                image: "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=400&h=300&fit=crop&crop=center"
            },
            {
                name: "Fresh Bell Peppers",
                category: "vegetables",
                price: 3.20,
                description: "Colorful bell peppers perfect for cooking or raw consumption.",
                farmer: "Pepper Patch",
                image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop&crop=center"
            },
            {
                name: "Organic Zucchini",
                category: "vegetables",
                price: 2.50,
                description: "Fresh zucchini perfect for grilling or baking.",
                farmer: "Squash Farm",
                image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop&crop=center"
            },
            {
                name: "Fresh Corn",
                category: "vegetables",
                price: 3.75,
                description: "Sweet, fresh corn on the cob from local fields.",
                farmer: "Corn Field Farm",
                image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop&crop=center"
            },
            {
                name: "Organic Peaches",
                category: "fruits",
                price: 4.25,
                description: "Juicy, sweet peaches from local orchards.",
                farmer: "Peach Orchard",
                image: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=300&fit=crop&crop=center"
            },
            {
                name: "Fresh Grapes",
                category: "fruits",
                price: 4.99,
                description: "Sweet, seedless grapes perfect for snacking.",
                farmer: "Vineyard Valley",
                image: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=300&fit=crop&crop=center"
            }
        ];

        const products = productList.map((product, index) => {
            const qualityScore = this.getRandomQualityScore();
            const qualityLevel = this.getQualityLevel(qualityScore);
            const qualityAssessmentDate = this.getRandomDate(); // Add quality assessment date
            
            return {
                id: `product-${index + 1}`,
                name: product.name,
                category: product.category,
                price: product.price,
                qualityScore: qualityScore,
                qualityLevel: qualityLevel,
                description: product.description,
                image: product.image,
                farmer: product.farmer,
                harvestDate: this.getRandomDate(),
                expiryDate: this.getExpiryDate(),
                qualityAssessmentDate: qualityAssessmentDate, // Add quality assessment date
                stock: Math.floor(Math.random() * 100) + 10,
                location: 'Local Market',
                certifications: ['Organic', 'Local'],
                lastUpdated: new Date().toISOString()
            };
        });

        this.products = products;
        this.saveProducts();
        return products;
    }

    /**
     * Get random quality score
     */
    getRandomQualityScore() {
        return Math.floor(Math.random() * 100) + 1;
    }

    /**
     * Get quality score based on level
     */
    getQualityScore(level) {
        const ranges = {
            excellent: [90, 100],
            good: [70, 89],
            fair: [50, 69],
            poor: [0, 49]
        };
        const [min, max] = ranges[level];
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Get product name based on category
     */
    getProductName(category, index) {
        const names = {
            vegetables: ['Organic Carrots', 'Fresh Tomatoes', 'Green Bell Peppers', 'Cucumbers', 'Spinach'],
            fruits: ['Apples', 'Bananas', 'Oranges', 'Strawberries', 'Grapes'],
            dairy: ['Fresh Milk', 'Cheese', 'Yogurt', 'Butter', 'Cream'],
            meat: ['Beef', 'Chicken', 'Pork', 'Lamb', 'Turkey'],
            grains: ['Wheat', 'Rice', 'Corn', 'Oats', 'Barley']
        };
        return names[category][index % names[category].length];
    }

    /**
     * Get product description
     */
    getProductDescription(category) {
        const descriptions = {
            vegetables: 'Fresh, locally grown organic vegetables',
            fruits: 'Sweet and juicy seasonal fruits',
            dairy: 'Fresh dairy products from local farms',
            meat: 'Premium quality meat from trusted farmers',
            grains: 'High-quality grains and cereals'
        };
        return descriptions[category];
    }

    /**
     * Get product image
     */
    getProductImage(category) {
        const images = {
            vegetables: '/images/vegetables.jpg',
            fruits: '/images/fruits.jpg',
            dairy: '/images/dairy.jpg',
            meat: '/images/meat.jpg',
            grains: '/images/grains.jpg'
        };
        return images[category] || '/images/default-product.jpg';
    }

    /**
     * Get random farmer name
     */
    getFarmerName() {
        const farmers = ['John Smith Farm', 'Green Valley Organics', 'Sunny Acres', 'Fresh Harvest Co.', 'Local Farm Co.'];
        return farmers[Math.floor(Math.random() * farmers.length)];
    }

    /**
     * Get random date
     */
    getRandomDate() {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        return date.toISOString().split('T')[0];
    }

    /**
     * Get expiry date
     */
    getExpiryDate() {
        const date = new Date();
        date.setDate(date.getDate() + Math.floor(Math.random() * 30) + 7);
        return date.toISOString().split('T')[0];
    }

    /**
     * Get location
     */
    getLocation() {
        const locations = ['Local Market', 'Farm Store', 'Community Market', 'Direct from Farm'];
        return locations[Math.floor(Math.random() * locations.length)];
    }

    /**
     * Get certifications
     */
    getCertifications() {
        const certs = ['Organic', 'Non-GMO', 'Local', 'Fresh'];
        return certs.slice(0, Math.floor(Math.random() * 3) + 1);
    }

    /**
     * Get all products
     */
    getAll() {
        return this.products;
    }

    /**
     * Get featured products
     */
    getFeatured(limit = 6) {
        return this.products
            .filter(product => product.qualityLevel === 'excellent')
            .slice(0, limit);
    }

    /**
     * Get products by category
     */
    getByCategory(category) {
        return this.products.filter(product => product.category === category);
    }

    /**
     * Search products
     */
    search(query) {
        const searchTerm = query.toLowerCase();
        return this.products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm) ||
            product.farmer.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm)
        );
    }

    /**
     * Get product by ID
     */
    getById(id) {
        return this.products.find(product => product.id === id);
    }

    /**
     * Update product
     */
    updateProduct(id, updates) {
        const productIndex = this.products.findIndex(product => product.id === id);
        if (productIndex === -1) {
            return null;
        }

        // Update quality level based on score
        if (updates.qualityScore !== undefined) {
            // Ensure quality score is rounded to whole number
            updates.qualityScore = Math.round(updates.qualityScore);
            
            // Validate quality score range (0-100)
            if (updates.qualityScore < 0) {
                updates.qualityScore = 0;
            } else if (updates.qualityScore > 100) {
                updates.qualityScore = 100;
            }
            
            updates.qualityLevel = this.getQualityLevel(updates.qualityScore);
            
            // Update quality assessment date when quality score is changed
            updates.qualityAssessmentDate = new Date().toISOString();
        }

        updates.lastUpdated = new Date().toISOString();
        this.products[productIndex] = { ...this.products[productIndex], ...updates };
        
        this.saveProducts();
        return this.products[productIndex];
    }

    /**
     * Get quality level from score
     */
    getQualityLevel(score) {
        if (score >= 90) return 'excellent';
        if (score >= 70) return 'good';
        if (score >= 50) return 'fair';
        return 'poor';
    }

    /**
     * Get quality statistics
     */
    getQualityStatistics() {
        const stats = {
            excellent: 0,
            good: 0,
            fair: 0,
            poor: 0,
            total: this.products.length,
            averageQuality: 0
        };

        let totalScore = 0;
        this.products.forEach(product => {
            stats[product.qualityLevel]++;
            totalScore += product.qualityScore;
        });

        stats.averageQuality = stats.total > 0 ? Math.round(totalScore / stats.total) : 0;
        return stats;
    }

    /**
     * Get AI insights
     */
    getAIInsights() {
        const stats = this.getQualityStatistics();
        const insights = {
            overallQuality: stats.averageQuality,
            qualityDistribution: {
                excellent: stats.excellent,
                good: stats.good,
                fair: stats.fair,
                poor: stats.poor
            },
            recommendations: this.generateRecommendations(stats)
        };

        return insights;
    }

    /**
     * Generate AI recommendations
     */
    generateRecommendations(stats) {
        const recommendations = [];

        if (stats.poor > 0) {
            recommendations.push({
                type: 'warning',
                title: 'Quality Issues Detected',
                description: `${stats.poor} products have poor quality scores. Immediate attention required.`,
                action: 'Review quality standards and storage conditions'
            });
        }

        if (stats.averageQuality < 70) {
            recommendations.push({
                type: 'info',
                title: 'Quality Improvement Needed',
                description: 'Overall quality score is below target. Consider quality improvement measures.',
                action: 'Implement quality control procedures'
            });
        }

        if (stats.excellent > stats.total * 0.6) {
            recommendations.push({
                type: 'success',
                title: 'Excellent Quality Standards',
                description: 'Over 60% of products meet excellent quality standards.',
                action: 'Maintain current quality procedures'
            });
        }

        return recommendations;
    }
}

module.exports = Product; 