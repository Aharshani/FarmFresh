# AI Model Training Guide for Quality Detection

## 🤖 **Overview**

This guide will help you create an AI model that can automatically detect whether food products are in good, rotten, or bad quality condition. The model uses Google Teachable Machine and TensorFlow.js for image classification.

---

## 🎯 **What the AI Model Detects**

### **Quality Classes:**

1. **Good Quality** 🟢
   - Fresh, safe for consumption
   - No visible defects
   - Proper color and texture
   - Examples: Fresh strawberries, crisp vegetables, unspoiled dairy

2. **Rotten** 🔴
   - Clearly spoiled/decayed
   - Mold, fungus, or bacterial growth
   - Unsafe for consumption
   - Examples: Moldy fruits, spoiled meat, rotten vegetables

3. **Bad Quality** 🟡
   - Quality issues but not completely spoiled
   - Bruising, discoloration, minor defects
   - Use with caution
   - Examples: Bruised fruits, slightly discolored vegetables, near-expiry dairy

---

## 📋 **Step-by-Step Training Process**

### **Step 1: Access Google Teachable Machine**

1. Go to [Google Teachable Machine](https://teachablemachine.withgoogle.com/)
2. Click **"Get Started"**
3. Select **"Image Project"** (not Audio or Pose)

### **Step 2: Create Your Classes**

1. **Rename the default classes:**
   - Class 1: `good`
   - Class 2: `rotten` 
   - Class 3: `bad`

2. **Add descriptions for each class:**
   - Good: "Fresh, safe, no defects"
   - Rotten: "Spoiled, moldy, unsafe"
   - Bad: "Quality issues, use caution"

### **Step 3: Collect Training Images**

#### **For "Good" Class (50-100 images):**
- Fresh, unspoiled products
- Proper lighting and clear images
- Various angles and backgrounds
- Different product types (fruits, vegetables, dairy, etc.)

#### **For "Rotten" Class (50-100 images):**
- Clearly spoiled products
- Visible mold, fungus, or decay
- Discolored or mushy products
- Products with obvious safety issues

#### **For "Bad" Class (50-100 images):**
- Products with minor quality issues
- Bruising, slight discoloration
- Near-expiry products
- Products that need attention but aren't completely spoiled

### **Step 4: Upload Training Images**

#### **Image Requirements:**
- **Format:** JPG, PNG, or GIF
- **Size:** 224x224 pixels (automatically resized)
- **Quality:** Clear, well-lit images
- **Quantity:** 50-100 images per class minimum

#### **Upload Process:**
1. Click on each class tab
2. Click **"Upload"** or drag and drop images
3. Use **"Webcam"** to capture live images
4. Use **"Microphone"** to record samples (for audio)

#### **Image Collection Tips:**
- **Diverse Lighting:** Include images in different lighting conditions
- **Multiple Angles:** Capture products from various angles
- **Different Backgrounds:** Use various backgrounds and surfaces
- **Real Products:** Use actual product images, not stock photos
- **Consistent Quality:** Ensure all images are clear and focused

### **Step 5: Train Your Model**

1. Click **"Train Model"** button
2. Wait for training to complete (usually 1-5 minutes)
3. Monitor the training progress
4. Check the **"Preview"** section to test your model

### **Step 6: Test Your Model**

#### **Using the Preview Section:**
1. Upload test images
2. Use webcam for live testing
3. Check prediction accuracy
4. Verify confidence levels

#### **Testing Tips:**
- Test with images not used in training
- Try edge cases and difficult examples
- Check if predictions match expectations
- Note confidence levels for different types of images

### **Step 7: Export Your Model**

1. Click **"Export Model"** button
2. Choose **"Tensorflow.js"** format
3. Copy the **model URL** (looks like: `https://teachablemachine.withgoogle.com/models/YOUR_MODEL_ID/`)
4. Save this URL for use in the application

---

## 🎯 **Training Best Practices**

### **Image Quality Guidelines:**

#### **✅ Do's:**
- Use high-quality, clear images
- Include diverse lighting conditions
- Capture multiple angles
- Use real product images
- Maintain consistent image quality
- Include various product types
- Use natural backgrounds

#### **❌ Don'ts:**
- Use blurry or low-quality images
- Use only stock photos
- Use images with watermarks
- Use images with text overlays
- Use images with extreme filters
- Use only one lighting condition
- Use only one angle

### **Data Balance:**

#### **Equal Distribution:**
- Aim for similar numbers of images in each class
- Avoid having one class with many more images than others
- Balance helps prevent bias in predictions

#### **Quality Over Quantity:**
- 50 high-quality images per class is better than 200 poor-quality images
- Focus on image clarity and relevance
- Remove any unclear or ambiguous images

### **Validation Strategy:**

#### **Test Set:**
- Reserve 10-20% of your images for testing
- Don't use these images in training
- Use them to validate model performance

#### **Cross-Validation:**
- Test with different types of products
- Test with different lighting conditions
- Test with edge cases and difficult examples

---

## 🔧 **Integration with FarmFresh**

### **Step 1: Update Model URL**

1. Open `public/js/ai-quality-detector.js`
2. Find the `modelUrl` property in the constructor
3. Replace `'https://teachablemachine.withgoogle.com/models/YOUR_MODEL_ID/'` with your actual model URL

```javascript
// In AIQualityDetector constructor
this.modelUrl = 'https://teachablemachine.withgoogle.com/models/YOUR_ACTUAL_MODEL_ID/';
```

### **Step 2: Test the Integration**

1. Open `public/ai-quality-demo.html` in your browser
2. Upload test images
3. Verify predictions are accurate
4. Check confidence levels

### **Step 3: Customize Quality Classes (Optional)**

You can customize the quality classes and their properties:

```javascript
// Custom quality classes
const customClasses = {
    'good': {
        label: 'Excellent Quality',
        description: 'Product is in perfect condition',
        severity: 'low',
        color: '#10B981',
        score: 90,
        recommendations: ['Safe to consume', 'Premium quality']
    },
    'rotten': {
        label: 'Severely Spoiled',
        description: 'Product is completely unsafe',
        severity: 'high',
        color: '#EF4444',
        score: 10,
        recommendations: ['Do not consume', 'Dispose immediately']
    },
    'bad': {
        label: 'Poor Quality',
        description: 'Product has significant issues',
        severity: 'medium',
        color: '#F59E0B',
        score: 30,
        recommendations: ['Use with extreme caution', 'Consider disposal']
    }
};

// Set custom classes
aiDetector.setQualityClasses(customClasses);
```

---

## 📊 **Model Performance Optimization**

### **Improving Accuracy:**

#### **1. Increase Training Data:**
- Add more images to each class
- Include more diverse examples
- Add edge cases and difficult examples

#### **2. Improve Image Quality:**
- Use higher resolution images
- Ensure consistent lighting
- Remove blurry or unclear images

#### **3. Balance Classes:**
- Ensure equal representation
- Avoid bias towards one class
- Include various product types

#### **4. Regular Retraining:**
- Retrain with new data periodically
- Update model as you get more examples
- Monitor performance over time

### **Monitoring Performance:**

#### **Key Metrics:**
- **Accuracy:** Overall prediction accuracy
- **Confidence:** Prediction confidence levels
- **False Positives:** Good products marked as bad
- **False Negatives:** Bad products marked as good

#### **Performance Indicators:**
- High confidence (>80%) for clear cases
- Lower confidence for ambiguous cases
- Consistent predictions across similar images
- Good performance on edge cases

---

## 🚨 **Safety Considerations**

### **Food Safety:**
- The AI model is a tool, not a replacement for human judgment
- Always follow food safety guidelines
- When in doubt, err on the side of caution
- The model should flag potential issues for human review

### **Model Limitations:**
- May not detect all types of spoilage
- Performance depends on training data quality
- Should be used as part of a broader quality control system
- Regular validation and updates are essential

### **Legal Considerations:**
- Ensure compliance with food safety regulations
- Use as part of a comprehensive quality control program
- Maintain records of quality assessments
- Follow industry best practices

---

## 🔄 **Maintenance and Updates**

### **Regular Maintenance:**
- Monitor model performance
- Collect feedback on predictions
- Update training data as needed
- Retrain model periodically

### **Continuous Improvement:**
- Add new types of products
- Include new quality issues
- Improve image quality
- Expand training dataset

### **Version Control:**
- Keep track of model versions
- Document changes and improvements
- Test new models before deployment
- Maintain backup models

---

## 📚 **Additional Resources**

### **Google Teachable Machine:**
- [Official Documentation](https://teachablemachine.withgoogle.com/)
- [Training Tips](https://teachablemachine.withgoogle.com/training)
- [Model Export Guide](https://teachablemachine.withgoogle.com/export)

### **TensorFlow.js:**
- [Official Documentation](https://www.tensorflow.org/js)
- [Image Classification Tutorial](https://www.tensorflow.org/js/tutorials)
- [Model Loading Guide](https://www.tensorflow.org/js/guide/save_load)

### **Food Safety Resources:**
- FDA Food Safety Guidelines
- USDA Food Safety Information
- Local food safety regulations
- Industry best practices

---

This comprehensive guide will help you create a robust AI model for quality detection that can significantly improve your food safety and quality control processes. Remember that the AI model is a tool to assist human judgment, not replace it entirely.
