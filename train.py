# #  SECTION 1: IMPORT LIBRARIES 

# import tensorflow as tf
# from tensorflow import keras
# from tensorflow.keras import layers
# from tensorflow.keras.preprocessing.image import ImageDataGenerator
# from tensorflow.keras.applications import MobileNetV2
# from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

# # SECTION 2: DEFINE PARAMETERS 

# # These are the settings for your project
# IMG_SIZE = (160, 160)             # The size to resize all your images to
# IMG_SHAPE = IMG_SIZE + (3,)       # Adds the 3 color channels (RGB)
# BATCH_SIZE = 32                   #How many images to process at a time
# TRAIN_DIR = 'data/train'
# VAL_DIR = 'data/validation'


# NUM_CLASSES = 2 # You have 3 folders: good_products, bad_products, rotten_products

# EPOCHS = 2     # How many times to loop over the entire dataset

# # SECTION 3: LOAD AND PREPARE DATA

# print("Loading and preparing data...")

# # This creates a "generator" that will:
# # 1. Read images from 'data/train' folder
# # 2. Apply the special 'preprocess_input' recipe for MobileNetV2
# # 3. Automatically label them based on the folder name
# # Add "Augmentation" parameters here
# # This creates new "fake" variations of your images on the fly
# train_datagen = ImageDataGenerator(
#     preprocessing_function=preprocess_input,
#     rotation_range=40,      # Rotate image randomly up to 40 degrees
#     width_shift_range=0.2,  # Shift image left/right
#     height_shift_range=0.2, # Shift image up/down
#     shear_range=0.2,        # Distort image shape
#     zoom_range=0.2,         # Zoom in/out
#     horizontal_flip=True,   # Flip image horizontally
#     fill_mode='nearest'     # Fill empty pixels after rotation
# )
# # This does the same for the 'data/validation' folder
# validation_datagen = ImageDataGenerator(
#     preprocessing_function=preprocess_input
# )

# # This connects the generator to 'train' directory
# train_generator = train_datagen.flow_from_directory(
#     TRAIN_DIR,
#     target_size=IMG_SIZE,
#     batch_size=BATCH_SIZE,
#     class_mode='categorical' # 'categorical' for 3 or more classes
# )

# # This connects the generator to your 'validation' directory
# validation_generator = validation_datagen.flow_from_directory(
#     VAL_DIR,
#     target_size=IMG_SIZE,
#     batch_size=BATCH_SIZE,
#     class_mode='categorical'
# )

# # --- SECTION 4: BUILD THE MODEL (FINE-TUNING VERSION) ---

# print("Building model with Fine-Tuning...")

# # 1. Load the Base Model (MobileNetV2)
# base_model = tf.keras.applications.MobileNetV2(
#     input_shape=IMG_SHAPE,
#     include_top=False,
#     weights='imagenet'
# )

# # 2. Unfreeze the top layers
# # We want to train the last 40 layers of the model to recognize specific fruit details
# base_model.trainable = True
# print(f"Total layers in base model: {len(base_model.layers)}")

# # Freeze the bottom layers (keep generic shapes/edges)
# fine_tune_at = 100
# for layer in base_model.layers[:fine_tune_at]:
#     layer.trainable = False

# print(f"Layers frozen up to {fine_tune_at}. Training layers {fine_tune_at}+.")

# # 3. Add the Classification Head
# inputs = tf.keras.Input(shape=IMG_SHAPE)
# x = base_model(inputs, training=False) # Important: keep BatchNorm in inference mode
# x = layers.GlobalAveragePooling2D()(x)
# x = layers.Dropout(0.2)(x)
# outputs = layers.Dense(NUM_CLASSES, activation='softmax')(x)

# model = tf.keras.Model(inputs, outputs)

# # --- SECTION 5: COMPILE THE MODEL ---

# print("Compiling with low learning rate...")

# # 4. Compile with a VERY LOW learning rate
# # This is critical! High rates will destroy the pre-trained weights.
# model.compile(
#     optimizer=tf.keras.optimizers.RMSprop(learning_rate=0.0001),
#     loss='categorical_crossentropy',
#     metrics=['accuracy']
# )

# model.summary()

# # --- SECTION 6: TRAIN THE MODEL ---

# print("Starting Fine-Tuning training...")

# # Add EarlyStopping to stop if it stops improving (saves time)
# early_stopping = tf.keras.callbacks.EarlyStopping(
#     monitor='val_loss',
#     patience=5,
#     restore_best_weights=True
# )

# history = model.fit(
#     train_generator,
#     epochs=EPOCHS, # Try setting this to 20 or 30
#     validation_data=validation_generator,
#     callbacks=[early_stopping]
# )

# print("Training complete!")

# # SECTION 7: SAVE YOUR FINAL MODEL 

# # This saves your newly trained model as a single file
# model.save('my_image_classifier.h5')

# print("Model has been saved as 'my_image_classifier.h5'")                            
  



import os
import tensorflow as tf
from tensorflow.keras import layers, models, optimizers
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

# --- CONFIGURATION ---
IMG_SIZE = (160, 160)
BATCH_SIZE = 32
EPOCHS = 10  # Increased slightly for 3 classes
TRAIN_DIR = 'data/train'
VAL_DIR = 'data/validation'
MODEL_SAVE_PATH = 'my_image_classifier.h5'

# --- 1. DATA GENERATORS ---
train_datagen = ImageDataGenerator(
    preprocessing_function=preprocess_input,
    rotation_range=20,      # Slight rotation to help generalize + or - 20 degrees(data)
    width_shift_range=0.1,
    height_shift_range=0.1,
    zoom_range=0.1,
    horizontal_flip=True,
    fill_mode='nearest'
)

val_datagen = ImageDataGenerator(
    preprocessing_function=preprocess_input
)

print("Loading Data...")
train_generator = train_datagen.flow_from_directory(
    TRAIN_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical'
)

validation_generator = val_datagen.flow_from_directory(
    VAL_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical'
)

# Auto-detect number of classes (Should be 3 now)
num_classes = train_generator.num_classes
print(f" Detected {num_classes} classes: {list(train_generator.class_indices.keys())}")

# --- 2. BUILD MODEL ---
base_model = MobileNetV2(
    input_shape=IMG_SIZE + (3,),
    include_top=False,
    weights='imagenet'
)
base_model.trainable = False # Freeze base initially

inputs = tf.keras.Input(shape=IMG_SIZE + (3,))
x = base_model(inputs, training=False)
x = layers.GlobalAveragePooling2D()(x)
x = layers.Dropout(0.2)(x)
outputs = layers.Dense(num_classes, activation='softmax')(x)

model = models.Model(inputs, outputs)

# --- 3. TRAIN ---
model.compile(
    optimizer=optimizers.Adam(learning_rate=0.001),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

print("Starting Training...")
history = model.fit(
    train_generator,
    epochs=EPOCHS,
    validation_data=validation_generator
)

# --- 4. SAVE ---
model.save(MODEL_SAVE_PATH)
print("Model saved successfully!")  