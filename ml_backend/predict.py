


import os
# Suppress TensorFlow logs
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

import tensorflow as tf
import numpy as np
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
import sys
import json

# --- CONFIGURATION ---
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'my_image_classifier.h5')
IMG_SIZE = (160, 160)

# 3 CLASSES 
CLASS_NAMES = ['bad_products', 'good_products', 'rotten_products']

def predict_image(image_path):
    try:
        # 1. Load Model
        tf.get_logger().setLevel('ERROR')
        model = tf.keras.models.load_model(MODEL_PATH)

        # 2. Load Original Image
        img = image.load_img(image_path, target_size=IMG_SIZE)
        x_orig = image.img_to_array(img)
        
        # 3. TTA: Create 5 Variations to "Check Work"
        # This prevents the model from being "too sure" about a confusing image
        batch = []
        
        # A. Original
        batch.append(preprocess_input(x_orig.copy()))
        
        # B. Flipped Left/Right
        batch.append(preprocess_input(tf.image.flip_left_right(x_orig).numpy()))
        
        # C. Zoomed (Central Crop 85%)
        x_zoom = tf.image.central_crop(x_orig, 0.85)
        x_zoom = tf.image.resize(x_zoom, IMG_SIZE).numpy()
        batch.append(preprocess_input(x_zoom))
        
        # D. Brighter
        x_bright = tf.image.adjust_brightness(x_orig, 0.15).numpy()
        batch.append(preprocess_input(x_bright))
        
        # E. Rotated (90 degrees)
        x_rot = tf.image.rot90(x_orig).numpy()
        batch.append(preprocess_input(x_rot))
        
        # 4. Predict on ALL 5 versions
        batch_np = np.array(batch)
        predictions = model.predict(batch_np, verbose=0)
        
        # 5. Average the results
        
        avg_pred = np.mean(predictions, axis=0) # [prob_bad, prob_good, prob_rotten]
        
        prob_bad = avg_pred[0]
        prob_good = avg_pred[1]
        prob_rotten = avg_pred[2]
        
        # 6. Calculate 0-100 Quality Score (Weighted Average)
        # Good = 100 points, Bad = 50 points, Rotten = 0 points
        # Formula: (Good * 100) + (Bad * 50) + (Rotten * 0)
        
        raw_score = (prob_good * 100) + (prob_bad * 50) + (prob_rotten * 0)
        quality_score = round(raw_score)

        # 7. Determine Class Label based on the *averaged* result
        max_index = np.argmax(avg_pred)
        predicted_class = CLASS_NAMES[max_index]

        # Optional: Override label if score contradicts class (Safety net)
        if quality_score > 70:
            predicted_class = 'good_products'
        elif quality_score < 30:
            predicted_class = 'rotten_products'
        else:
            predicted_class = 'bad_products'

        result = {
            "success": True,
            "prediction": {
                "class": predicted_class,
                "confidence": float(np.max(avg_pred)),
                "score_percent": quality_score
            }
        }
        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))

if __name__ == "__main__":
    if len(sys.argv) > 1:
        predict_image(sys.argv[1])
    else:
        print(json.dumps({"success": False, "error": "No image path provided"}))


     























     # import os
# os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

# import tensorflow as tf
# import numpy as np
# from tensorflow.keras.preprocessing import image
# from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
# import sys
# import json

# # --- CONFIGURATION ---
# MODEL_PATH = os.path.join(os.path.dirname(__file__), 'my_image_classifier.h5')
# IMG_SIZE = (160, 160)
# CLASS_NAMES = ['bad_products', 'good_products', 'rotten_products']

# def predict_image(image_path):
#     try:
#         # 1. Load Model
#         tf.get_logger().setLevel('ERROR')
#         model = tf.keras.models.load_model(MODEL_PATH)

#         # 2. Load Original Image
#         img = image.load_img(image_path, target_size=IMG_SIZE)
#         x_orig = image.img_to_array(img)
        
#         # 3. Create 5 Variations (Test Time Augmentation)
#         # This forces the model to be honest, not just memorizing
#         batch = []
        
#         # Variation A: Original
#         batch.append(preprocess_input(x_orig.copy()))
        
#         # Variation B: Flipped Left/Right
#         batch.append(preprocess_input(tf.image.flip_left_right(x_orig).numpy()))
        
#         # Variation C: Slight Zoom (Central Crop)
#         # Crop 90% and resize back
#         x_zoom = tf.image.central_crop(x_orig, 0.9)
#         x_zoom = tf.image.resize(x_zoom, IMG_SIZE).numpy()
#         batch.append(preprocess_input(x_zoom))
        
#         # Variation D: Brighter
#         x_bright = tf.image.adjust_brightness(x_orig, 0.1).numpy()
#         batch.append(preprocess_input(x_bright))
        
#         # Variation E: Darker
#         x_dark = tf.image.adjust_brightness(x_orig, -0.1).numpy()
#         batch.append(preprocess_input(x_dark))
        
#         # Convert list to numpy array
#         batch_np = np.array(batch)

#         # 4. Predict on ALL variations at once
#         predictions = model.predict(batch_np, verbose=0)
        
#         # 5. Average the results
#         # This gives a much smoother score (e.g. 0.75 instead of 1.0)
#         avg_pred = np.mean(predictions, axis=0)
        
#         # 6. Calculate "Goodness Score" (0-100)
#         # good_products is index 0. We use this probability directly.
#         # If it's Rotten, the 'good' prob will be low (e.g. 0.05 -> Score 5)
#         # If it's Good, the 'good' prob will be high (e.g. 0.95 -> Score 95)
        
#         goodness_prob = avg_pred[0] 
        
#         # Add a small multiplier to spread the scores out more (Optional)
#         # This helps push "unsure" images towards the middle
#         quality_score = round(goodness_prob * 100)

#         # Determine Class Label based on Score
#         if quality_score >= 60:
#             predicted_class = "good_products"
#         else:
#             predicted_class = "rotten_products"

#         result = {
#             "success": True,
#             "prediction": {
#                 "class": predicted_class,
#                 "confidence": float(goodness_prob),
#                 "score_percent": quality_score
#             }
#         }
#         print(json.dumps(result))

#     except Exception as e:
#         error_result = { "success": False, "error": str(e) }
#         print(json.dumps(error_result))

# if __name__ == "__main__":
#     if len(sys.argv) > 1:
#         predict_image(sys.argv[1])
#     else:
#         print(json.dumps({"success": False, "error": "No image path provided"}))