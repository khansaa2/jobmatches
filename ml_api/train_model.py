import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.pipeline import Pipeline
import joblib
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import re

# Download required NLTK data
nltk.download('stopwords')
nltk.download('wordnet')
nltk.download('punkt')

# Initialize NLTK components
lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words('english'))

def preprocess(text):
    if pd.isna(text):
        return ""
    text = str(text).lower()
    # Keep alphanumeric characters, spaces, and common punctuation
    text = re.sub(r'[^a-z0-9\s\.,]', ' ', text)
    # Replace multiple spaces with single space
    text = re.sub(r'\s+', ' ', text)
    words = text.split()
    words = [lemmatizer.lemmatize(w) for w in words if w not in stop_words]
    return ' '.join(words)

# Load and preprocess the data
print("Loading dataset...")
df = pd.read_csv('../jobmatches/src/main/resources/job_dataset_100k.csv')

# Combine relevant columns for training
print("Preprocessing data...")
df['combined_text'] = df.apply(
    lambda x: ' '.join([
        str(x['Job Title']) * 2,  # Give more weight to the job title
        preprocess(x['Job Description']),
        preprocess(x['Key Skills']) * 2,  # Give more weight to skills
        preprocess(x['Role Category'])
    ]),
    axis=1
)

# Prepare target variable
print("Encoding labels...")
label_encoder = LabelEncoder()
y = label_encoder.fit_transform(df['Job Title'])

# Create and train the pipeline
print("Training model...")
pipeline = Pipeline([
    ('tfidf', TfidfVectorizer(
        max_features=15000,  # Increased from 10000
        ngram_range=(1, 2),  # Add bigrams
        min_df=2,  # Remove very rare terms
        max_df=0.95  # Remove very common terms
    )),
    ('clf', RandomForestClassifier(
        n_estimators=200,  # Increased from 100
        max_depth=20,  # Add max_depth to prevent overfitting
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1  # Use all CPU cores
    ))
])

pipeline.fit(df['combined_text'], y)

# Save the model and encoder
print("Saving model...")
joblib.dump(pipeline, 'cv_rf_predictor.pkl')
joblib.dump(label_encoder, 'rf_label_encoder.pkl')

print("Training complete!")