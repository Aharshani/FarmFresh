# 🤖 Teachable Machine Integration Setup Guide

This guide explains how to integrate custom trained Teachable Machine models for quality assessment in the FarmFresh application.

## 📋 Prerequisites

- Modern web browser (Chrome, Safari, Firefox)
- Access to [Google Teachable Machine](https://teachablemachine.withgoogle.com/train/image)
- Sample images for training your quality detection model

## 🎯 Training Your Custom Model

### Step 1: Create a New Project
1. Go to [https://teachablemachine.withgoogle.com/train/image](https://teachablemachine.withgoogle.com/train/image)
2. Click "Get Started" or "Create a new project"
3. Select "Image Project" for image classification

### Step 2: Define Quality Classes
Create classes for your quality categories. Here are some examples:

#### For General Food Quality:
- `excellent_quality` - Perfect condition products
- `good_quality` - Good condition with minor issues
- `fair_quality` - Acceptable but showing signs of age
- `poor_quality` - Poor condition, not recommended

#### For Specific Products (e.g., Strawberries):
- `perfect_strawberry` - Fresh, bright red, no defects
- `good_strawberry` - Good condition, minor blemishes
- `slightly_bruised` - Some bruising but still edible
- `bruised_strawberry` - Significant bruising
- `moldy_strawberry` - Visible mold growth
- `rotten_strawberry` - Completely spoiled
- `fungus_strawberry` - Fungal contamination

### Step 3: Upload Training Images
For each class, upload 20-50 sample images:
- **Excellent/Perfect**: High-quality, fresh products
- **Good**: Slightly aged but still good products
- **Fair**: Products showing some deterioration
- **Poor/Rotten**: Damaged, spoiled, or contaminated products

### Step 4: Train the Model
1. Click "Train Model"
2. Wait for training to complete
3. Test with sample images to verify accuracy

### Step 5: Export the Model
1. Click "Export Model"
2. Choose "TensorFlow.js" format
3. Copy the model URL (e.g., `https://teachablemachine.withgoogle.com/models/YOUR_MODEL_ID/`)

## 🔧 Integration with FarmFresh

### Method 1: Quick Setup (Recommended)

1. **Open Browser Console** on the quality assessment page
2. **Run this command** with your model URL:

```javascript
// Replace YOUR_MODEL_ID with your actual model ID
const customModelUrl = 'https://teachablemachine.withgoogle.com/models/YOUR_MODEL_ID/';
const customClassifications = {
    'excellent_quality': { label: 'Excellent Quality', severity: 'low', color: '#059669' },
    'good_quality': { label: 'Good Quality', severity: 'low', color: '#10B981' },
    'fair_quality': { label: 'Fair Quality', severity: 'medium', color: '#F59E0B' },
    'poor_quality': { label: 'Poor Quality', severity: 'high', color: '#EF4444' }
};

window.teachableMachineConfig.configureCustomModel(customModelUrl, customClassifications);
```

### Method 2: Permanent Integration

1. **Edit** `public/js/quality-assessment.js`
2. **Find** the `initializeTeachableMachineConfig()` method
3. **Uncomment** and update these lines:

```javascript
const customModelUrl = 'https://teachablemachine.withgoogle.com/models/YOUR_MODEL_ID/';
const customClassifications = window.teachableMachineConfig.setupFoodQualityModel();
window.teachableMachineConfig.configureCustomModel(customModelUrl, customClassifications);
```

## 🎯 Quality Score Mapping

The system automatically maps your model's classes to quality scores:

| Class | Quality Score Range | Base Score |
|-------|-------------------|------------|
| excellent_quality | 90-100 | 95 |
| good_quality | 75-89 | 82 |
| fair_quality | 60-74 | 67 |
| poor_quality | 0-59 | 30 |

## 🧪 Testing Your Custom Model

### Step 1: Upload Test Images
1. Go to the quality assessment page
2. Upload images that match your training classes
3. Check the browser console for detailed logs

### Step 2: Verify Results
Look for these console messages:
```
🔧 Configuring custom Teachable Machine model...
✅ Custom model configured successfully
🔍 Analyzing image with Teachable Machine...
📊 Teachable Machine predictions: [...]
🎯 Quality score calculation: excellent_quality (0.85) = 95.0
```

### Step 3: Check Quality Analysis Modal
- Overall Score should match the quality score
- Risk Level should be appropriate for the detected class
- Recommendations should be specific to the detected issue

## 🔧 Customization Options

### Custom Classifications
You can define custom labels, severity levels, and colors:

```javascript
const customClassifications = {
    'your_class_name': { 
        label: 'Your Display Label', 
        severity: 'low|medium|high', 
        color: '#HEXCODE' 
    }
};
```

### Custom Quality Score Mapping
Override the default score mapping:

```javascript
const customScoreMapping = {
    'your_class': { min: 80, max: 100, baseScore: 90 }
};
```

## 🚨 Troubleshooting

### Model Not Loading
- Check if the model URL is correct
- Ensure the model is publicly accessible
- Try accessing the model URL directly in browser

### Predictions Not Accurate
- Retrain with more diverse images
- Add more training samples per class
- Ensure consistent lighting in training images

### Quality Score Issues
- Check browser console for error messages
- Verify class names match between training and configuration
- Ensure fallback mechanisms are working

## 📚 Example Configurations

### Food Quality Model
```javascript
const foodQualityModel = {
    'excellent': { label: 'Excellent Quality', severity: 'low', color: '#059669' },
    'good': { label: 'Good Quality', severity: 'low', color: '#10B981' },
    'fair': { label: 'Fair Quality', severity: 'medium', color: '#F59E0B' },
    'poor': { label: 'Poor Quality', severity: 'high', color: '#EF4444' }
};
```

### Strawberry Quality Model
```javascript
const strawberryModel = {
    'perfect_strawberry': { label: 'Perfect Strawberry', severity: 'low', color: '#059669' },
    'good_strawberry': { label: 'Good Strawberry', severity: 'low', color: '#10B981' },
    'slightly_bruised': { label: 'Slightly Bruised', severity: 'medium', color: '#F59E0B' },
    'moldy_strawberry': { label: 'Moldy Strawberry', severity: 'high', color: '#6B7280' },
    'rotten_strawberry': { label: 'Rotten Strawberry', severity: 'high', color: '#EF4444' }
};
```

## 🎉 Success Indicators

When properly configured, you should see:
- ✅ Custom model loads successfully
- ✅ Predictions match your training classes
- ✅ Quality scores are appropriate for detected classes
- ✅ Risk levels and recommendations are accurate
- ✅ Overall score equals quality score

## 🔄 Fallback System

The system includes multiple fallback mechanisms:
1. **Teachable Machine** (Primary)
2. **YOLO Detection** (Secondary)
3. **Traditional Analysis** (Tertiary)
4. **Default Score** (Final fallback)

This ensures quality assessment always works, even if your custom model fails to load.

---

**Need Help?** Check the browser console for detailed error messages and debugging information. 