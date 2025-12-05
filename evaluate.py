import os
import numpy as np
import tensorflow as tf
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import classification_report, confusion_matrix, precision_recall_curve, average_precision_score
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

# --- CONFIGURATION ---
MODEL_PATH = 'my_image_classifier.h5'
VAL_DIR = 'data/validation'
IMG_SIZE = (160, 160)
BATCH_SIZE = 32

def evaluate_model():
    # 1. Load Model
    print("Loading model...")
    try:
        model = tf.keras.models.load_model(MODEL_PATH)
    except Exception as e:
        print(f"Error loading model: {e}")
        return

    # 2. Prepare Validation Data
    val_datagen = ImageDataGenerator(preprocessing_function=preprocess_input)
    
    if not os.path.exists(VAL_DIR):
        print(f"Error: Validation directory '{VAL_DIR}' not found!")
        return

    print("Loading validation images...")
    validation_generator = val_datagen.flow_from_directory(
        VAL_DIR,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        shuffle=False  # Crucial for matching predictions to true labels
    )

    # 3. Make Predictions
    print("Running predictions... (This may take a moment)")
    predictions = model.predict(validation_generator, verbose=1)
    
    # Convert to class indices
    predicted_classes = np.argmax(predictions, axis=1)
    true_classes = validation_generator.classes
    class_labels = list(validation_generator.class_indices.keys())
    
    print(f"Classes found: {class_labels}")

    # --- METRIC 1: CLASSIFICATION REPORT ---
    print("\n")
    print("              CLASSIFICATION REPORT")
    print("\n")
    
    # FIX: We explicitly pass 'labels' so it doesn't crash if a class is missing from predictions
    print(classification_report(
        true_classes, 
        predicted_classes, 
        target_names=class_labels,
        labels=range(len(class_labels)) 
    ))

    # --- METRIC 2: CONFUSION MATRIX ---
    print("\nGenerating Confusion Matrix...")
    cm = confusion_matrix(true_classes, predicted_classes)
    
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=class_labels, yticklabels=class_labels)
    plt.title('Confusion Matrix')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.tight_layout()
    plt.show()

    # --- METRIC 3: PRECISION-RECALL CURVE ---
    print("\nGenerating Precision-Recall Curves...")
    
    n_classes = len(class_labels)
    y_true = tf.keras.utils.to_categorical(true_classes, n_classes)
    
    plt.figure(figsize=(10, 8))
    
    for i in range(n_classes):
        if np.sum(y_true[:, i]) > 0: # Only plot if there are actual samples for this class
            precision, recall, _ = precision_recall_curve(y_true[:, i], predictions[:, i])
            avg_precision = average_precision_score(y_true[:, i], predictions[:, i])
            plt.plot(recall, precision, lw=2, label=f'{class_labels[i]} (AP = {avg_precision:.2f})')

    plt.xlabel("Recall")
    plt.ylabel("Precision")
    plt.title("Precision-Recall Curve")
    plt.legend(loc="best")
    plt.grid(alpha=0.3)
    plt.show()

if __name__ == "__main__":
    evaluate_model()



    