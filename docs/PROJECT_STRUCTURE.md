# FarmFresh Project Structure

## Overview
This document describes the organized file structure of the FarmFresh project, designed for maintainability, scalability, and clear separation of concerns.

## Directory Structure

```
FarmFresh/
├── 📁 public/                    # Static assets served to the browser
│   ├── 📁 css/                   # Stylesheets
│   │   └── styles.css            # Main CSS file with all styles
│   ├── 📁 js/                    # JavaScript files
│   │   ├── main.js               # Core functionality and utilities
│   │   ├── cart.js               # Shopping cart management system
│   │   └── forms.js              # Form handling and validation
│   ├── 📁 images/                # Image assets
│   └── *.html                    # All HTML pages (19 files)
│
├── 📁 src/                       # Server-side source code
│   ├── server.js                 # Main Express server
│   └── dev.js                    # Development server with enhanced logging
│
├── 📁 docs/                      # Documentation
│   ├── README.md                 # Main project documentation
│   └── PROJECT_STRUCTURE.md      # This file
│
├── 📁 scripts/                   # Build and utility scripts
├── 📁 node_modules/              # Node.js dependencies
├── package.json                  # Project configuration and dependencies
├── package-lock.json             # Dependency lock file
└── .gitignore                    # Git ignore rules
```

## Detailed Breakdown

### 📁 public/
Contains all static assets that are served directly to the browser.

#### 📁 public/css/
- **styles.css**: Complete CSS file with all custom styles, responsive design, and component styles

#### 📁 public/js/
- **main.js**: Core JavaScript functionality including:
  - Event listeners and DOM manipulation
  - Mobile menu toggle
  - Search functionality
  - Utility functions
- **cart.js**: Shopping cart management system including:
  - Cart state management
  - Local storage persistence
  - UI updates and interactions
  - Quantity controls
- **forms.js**: Form handling and validation including:
  - Password visibility toggles
  - Form validation
  - Submission handling
  - Error display

#### 📁 public/images/
- Product images and site assets
- Optimized for web delivery

#### *.html Files (19 total)
All HTML pages with consistent structure:
- **index.html**: Homepage
- **products.html**: Product catalog
- **markets.html**: Farmer's markets
- **farmers.html**: Farmer profiles
- **about.html**: About us
- **contact-us.html**: Contact information
- **faqs.html**: Frequently asked questions
- **how-it-works.html**: Platform explanation
- **delivery-information.html**: Delivery policies
- **returns-refunds.html**: Return policies
- **careers.html**: Job opportunities
- **press.html**: Press releases
- **farm-visit.html**: Farm tour experience
- **sign-in.html**: User login
- **register.html**: User registration
- **forgot-password.html**: Password recovery

### 📁 src/
Server-side source code and configuration.

#### server.js
Main Express server with:
- Static file serving from public directory
- Route handling for HTML pages
- Development info endpoint
- Error handling

#### dev.js
Development server with enhanced features:
- Detailed logging and information display
- Page listing
- Cart system status
- Development tools

### 📁 docs/
Project documentation and guides.

### 📁 scripts/
Build scripts and utilities (for future use).

## File Organization Principles

### 1. Separation of Concerns
- **Static assets** (HTML, CSS, JS, images) in `public/`
- **Server code** in `src/`
- **Documentation** in `docs/`

### 2. Clear Naming Conventions
- Descriptive file names
- Consistent naming patterns
- Logical grouping

### 3. Modular Structure
- Each JavaScript file has a specific purpose
- CSS organized by component and functionality
- HTML pages follow consistent structure

### 4. Scalability
- Easy to add new pages
- Simple to extend functionality
- Clear paths for future enhancements

## Development Workflow

### Starting the Server
```bash
# Production server
npm start

# Development server with enhanced logging
npm run dev
```

### File Locations
- **HTML pages**: `public/*.html`
- **Styles**: `public/css/styles.css`
- **JavaScript**: `public/js/`
- **Server code**: `src/`
- **Documentation**: `docs/`

### Adding New Features
1. **New pages**: Add HTML file to `public/`
2. **New styles**: Add to `public/css/styles.css`
3. **New functionality**: Add to appropriate JS file in `public/js/`
4. **Server changes**: Modify files in `src/`

## Benefits of This Structure

### 1. Maintainability
- Clear organization makes it easy to find and modify files
- Logical separation reduces confusion
- Consistent patterns across the project

### 2. Performance
- Static assets served efficiently
- Optimized file serving paths
- Clear caching strategies

### 3. Collaboration
- Easy for team members to understand
- Clear file responsibilities
- Simple onboarding process

### 4. Scalability
- Easy to add new features
- Simple to extend functionality
- Clear upgrade paths

## Future Enhancements

This structure supports future additions such as:
- **Build tools**: Webpack, Vite, or similar
- **CSS preprocessors**: SASS, LESS
- **JavaScript bundling**: ES6 modules, bundling
- **Database integration**: API routes in `src/`
- **Authentication**: User management systems
- **Payment processing**: E-commerce features

## Best Practices

1. **Keep public/ clean**: Only serve necessary files
2. **Use consistent naming**: Follow established patterns
3. **Document changes**: Update this file when structure changes
4. **Test thoroughly**: Ensure all paths work correctly
5. **Optimize assets**: Compress images and minify code for production 