# FarmFresh Application Workflow

## 🏗️ **System Architecture Overview**

FarmFresh is a comprehensive local farmer's market platform that connects consumers with local farmers, featuring AI-powered quality assessment, dynamic pricing, and real-time inventory management.

---

## 📋 **Core User Workflows**

### **1. Customer Journey**

#### **1.1 Product Discovery & Shopping**
```mermaid
graph TD
    A[Customer Visits Site] --> B[Browse Products Page]
    B --> C[View Product Cards]
    C --> D[Check Stock Levels]
    D --> E[View Quality Scores]
    E --> F[See Dynamic Pricing]
    F --> G[Add Items to Cart]
    G --> H[Manage Cart Quantities]
    H --> I[Proceed to Checkout]
    
    C --> J[Search Products]
    J --> K[Filter by Category]
    K --> L[Sort by Price/Quality]
    L --> G
    
    C --> M[View Product Info]
    M --> N[See Health Benefits]
    N --> O[Check Best Uses]
    O --> G
```

#### **1.2 Cart Management**
```mermaid
graph TD
    A[Add Item to Cart] --> B[Stock Validation]
    B --> C{Stock Available?}
    C -->|Yes| D[Reduce Stock]
    C -->|No| E[Show Error Message]
    D --> F[Update Cart Display]
    F --> G[Update Product Cards]
    G --> H[Save to Local Storage]
    
    I[Update Quantity] --> J{Increase/Decrease?}
    J -->|Increase| K[Check Stock]
    J -->|Decrease| L[Restore Stock]
    K --> M{Stock Available?}
    M -->|Yes| N[Reduce Stock]
    M -->|No| O[Show Error]
    L --> P[Increase Stock]
    
    Q[Remove Item] --> R[Restore Stock]
    R --> S[Update Display]
    
    T[Clear Cart] --> U[Restore All Stock]
    U --> V[Reset Cart]
```

#### **1.3 Checkout Process**
```mermaid
graph TD
    A[Proceed to Checkout] --> B[Review Cart Items]
    B --> C[Enter Shipping Details]
    C --> D[Select Delivery Method]
    D --> E[Enter Payment Info]
    E --> F[Validate Form]
    F --> G{Validation Pass?}
    G -->|No| H[Show Errors]
    G -->|Yes| I[Process Payment]
    I --> J{Payment Success?}
    J -->|No| K[Show Payment Error]
    J -->|Yes| L[Create Order]
    L --> M[Clear Cart Without Restoring Stock]
    M --> N[Show Success]
    N --> O[Redirect to Confirmation]
```

### **2. Farmer/Admin Journey**

#### **2.1 Product Management**
```mermaid
graph TD
    A[Farmer Login] --> B[Access Product Dashboard]
    B --> C[View Product List]
    C --> D[Add New Product]
    D --> E[Upload Product Image]
    E --> F[Set Product Details]
    F --> G[Set Initial Stock]
    G --> H[Save Product]
    
    I[Edit Product] --> J[Update Information]
    J --> K[Modify Stock Levels]
    K --> L[Update Pricing]
    L --> M[Save Changes]
    
    N[Quality Assessment] --> O[Upload Product Image]
    O --> P[AI Analysis]
    P --> Q[Get Quality Score]
    Q --> R[Set Expiry Date]
    R --> S[Update Product]
```

#### **2.2 AI Quality Assessment**
```mermaid
graph TD
    A[Upload Product Image] --> B[Initialize AI Models]
    B --> C{Teachable Machine Available?}
    C -->|Yes| D[Teachable Machine Analysis]
    C -->|No| E[YOLO Analysis]
    D --> F[Get Quality Classification]
    E --> G[Get Object Detection]
    F --> H[Calculate Quality Score]
    G --> H
    H --> I[Set Quality Level]
    I --> J[Update Product Record]
    J --> K[Apply Dynamic Pricing]
    K --> L[Update Display]
```

### **3. Market Discovery**

#### **3.1 Market Search & Filtering**
```mermaid
graph TD
    A[Visit Markets Page] --> B[View Market List]
    B --> C[Search Markets]
    C --> D[Filter by Day]
    D --> E[Filter by Distance]
    E --> F[View Market Details]
    F --> G[See Vendor List]
    G --> H[Check Market Schedule]
    H --> I[View Market Location]
    
    J[Enhanced Search] --> K[Enter Search Terms]
    K --> L[Select Filters]
    L --> M[View Results]
    M --> N[Reset Search]
    N --> O[Clear All Filters]
```

#### **3.2 Farm Tour Booking**
```mermaid
graph TD
    A[Visit Farm Tours Page] --> B[View Available Tours]
    B --> C[Select Tour]
    C --> D[View Tour Details]
    D --> E[Check Available Days]
    E --> F[Select Date]
    F --> G[Choose Time Slot]
    G --> H[Enter Group Size]
    H --> I[Fill Personal Details]
    I --> J[Accept Terms]
    J --> K[Submit Booking]
    K --> L[Receive Confirmation]
    L --> M[Get Email Details]
```

---

## 🔧 **Technical Workflows**

### **4. Stock Management System**
```mermaid
graph TD
    A[Product Added to Cart] --> B[Check Stock Availability]
    B --> C{Stock Sufficient?}
    C -->|Yes| D[Reduce Stock in Database]
    C -->|No| E[Show Error Message]
    D --> F[Update Product Display]
    F --> G[Update Cart Count]
    
    H[Item Removed from Cart] --> I[Restore Stock to Database]
    I --> J[Update Product Display]
    
    K[Order Completed] --> L[Clear Cart Without Restoring Stock]
    L --> M[Stock Permanently Reduced]
    
    N[Cart Cleared Manually] --> O[Restore All Stock]
    O --> P[Reset All Product Displays]
```

### **5. Dynamic Pricing System**
```mermaid
graph TD
    A[Product Loaded] --> B[Check Expiry Date]
    B --> C[Calculate Days Until Expiry]
    C --> D{Expired?}
    D -->|Yes| E[Mark as Unavailable]
    D -->|No| F[Calculate Discount]
    F --> G{Discount Level?}
    G -->|0 Days| H[50% Discount]
    G -->|1-2 Days| I[30% Discount]
    G -->|3-6 Days| J[15% Discount]
    G -->|7+ Days| K[No Discount]
    H --> L[Update Price Display]
    I --> L
    J --> L
    K --> L
    L --> M[Show Discount Badge]
```

### **6. AI Integration Workflow**
```mermaid
graph TD
    A[Image Upload] --> B[Initialize TensorFlow.js]
    B --> C[Load AI Models]
    C --> D{Model Type?}
    D -->|Teachable Machine| E[Load Custom Model]
    D -->|YOLO| F[Load YOLO Model]
    E --> G[Image Classification]
    F --> H[Object Detection]
    G --> I[Quality Assessment]
    H --> I
    I --> J[Generate Quality Score]
    J --> K[Update Product Record]
    K --> L[Apply Quality-Based Pricing]
```

---

## 📊 **Data Flow Architecture**

### **7. API Integration**
```mermaid
graph TD
    A[Frontend Request] --> B[API Gateway]
    B --> C[Product API]
    B --> D[Cart API]
    B --> E[Order API]
    B --> F[Quality API]
    
    C --> G[Product Database]
    D --> H[Cart Storage]
    E --> I[Order Database]
    F --> J[AI Models]
    
    K[Stock Updates] --> L[Real-time Sync]
    L --> M[Product Display Updates]
    L --> N[Cart Validation]
```

### **8. Storage Management**
```mermaid
graph TD
    A[User Session] --> B[Local Storage]
    B --> C[Cart Items]
    B --> D[User Preferences]
    B --> E[Search History]
    
    F[Server Storage] --> G[Product Database]
    F --> H[Order Records]
    F --> I[User Accounts]
    F --> J[Quality Assessments]
    
    K[Image Storage] --> L[Product Images]
    K --> M[Quality Assessment Images]
    K --> N[Market Photos]
```

---

## 🎯 **Key Features & Capabilities**

### **Customer Features:**
- ✅ **Real-time Stock Management** - Live inventory tracking
- ✅ **Dynamic Pricing** - Automatic discounts based on expiry
- ✅ **AI Quality Assessment** - Machine learning quality detection
- ✅ **Smart Search & Filtering** - Advanced product discovery
- ✅ **Farm Tour Booking** - Interactive tour scheduling
- ✅ **Market Discovery** - Local market finder with filters

### **Farmer/Admin Features:**
- ✅ **Product Management** - Full CRUD operations
- ✅ **Quality Assessment** - AI-powered quality detection
- ✅ **Stock Management** - Real-time inventory control
- ✅ **Order Processing** - Complete order lifecycle
- ✅ **Analytics Dashboard** - Sales and quality insights

### **Technical Features:**
- ✅ **Responsive Design** - Mobile-first approach
- ✅ **Progressive Web App** - Offline capabilities
- ✅ **Real-time Updates** - Live data synchronization
- ✅ **AI Integration** - TensorFlow.js and Teachable Machine
- ✅ **API-First Architecture** - RESTful API design

---

## 🔄 **System Integration Points**

### **External Services:**
- **Google Teachable Machine** - AI quality assessment
- **TensorFlow.js** - Machine learning framework
- **Local Storage** - Client-side data persistence
- **RESTful APIs** - Backend communication
- **Image Processing** - Product image analysis

### **Data Synchronization:**
- **Real-time Stock Updates** - Live inventory management
- **Cart Persistence** - Cross-session cart maintenance
- **Quality Assessment Sync** - AI results integration
- **Order Processing** - Complete transaction flow

---

## 📈 **Performance Optimizations**

### **Frontend Optimizations:**
- **Lazy Loading** - Images and components
- **Debounced Search** - Reduced API calls
- **Cached Data** - Local storage utilization
- **Progressive Enhancement** - Graceful degradation

### **Backend Optimizations:**
- **API Caching** - Reduced database queries
- **Batch Processing** - Efficient bulk operations
- **Image Compression** - Optimized storage
- **Database Indexing** - Fast query performance

---

## 🛡️ **Security & Validation**

### **Data Validation:**
- **Input Sanitization** - XSS prevention
- **Form Validation** - Client and server-side
- **Stock Validation** - Prevent overselling
- **Payment Validation** - Secure transaction processing

### **Error Handling:**
- **Graceful Degradation** - Fallback mechanisms
- **User Feedback** - Clear error messages
- **Logging & Monitoring** - System health tracking
- **Recovery Mechanisms** - Automatic retry logic

---

This workflow documentation provides a comprehensive overview of how users interact with the FarmFresh platform, from initial product discovery through order completion, including all the technical processes that power the system.
