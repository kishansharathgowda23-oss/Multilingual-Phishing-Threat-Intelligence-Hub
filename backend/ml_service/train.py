import os
import pandas as pd
import urllib.request
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression
from sklearn.neural_network import MLPClassifier
from sklearn.pipeline import Pipeline
import joblib

# URL for a public SMS Spam Collection dataset (tab-separated)
DATA_URL = "https://raw.githubusercontent.com/justmarkham/pycon-2016-tutorial/master/data/sms.tsv"
DATA_FILE = "sms_spam.tsv"
MODELS_DIR = "models"

def download_data():
    if not os.path.exists(DATA_FILE):
        print(f"Downloading dataset from {DATA_URL}...")
        urllib.request.urlretrieve(DATA_URL, DATA_FILE)
        print("Download complete.")

def train_models():
    download_data()
    print("Loading data...")
    # The dataset has two columns: label (ham/spam) and message
    df = pd.read_csv(DATA_FILE, sep='\t', header=None, names=['label', 'message'])
    
    # Convert labels to binary: spam=1, ham=0
    df['is_spam'] = df['label'].map({'spam': 1, 'ham': 0})
    
    X = df['message']
    y = df['is_spam']
    
    print("Fitting TF-IDF Vectorizer...")
    vectorizer = TfidfVectorizer(stop_words='english', max_features=5000)
    X_vec = vectorizer.fit_transform(X)
    
    if not os.path.exists(MODELS_DIR):
        os.makedirs(MODELS_DIR)
        
    print("Saving vectorizer...")
    joblib.dump(vectorizer, os.path.join(MODELS_DIR, 'vectorizer.pkl'))

    # Define the 5 models
    models = {
        'RF': RandomForestClassifier(n_estimators=100, random_state=42),
        'SVM': SVC(probability=True, random_state=42),
        'NB': MultinomialNB(),
        'LR': LogisticRegression(random_state=42, max_iter=1000),
        'LSTM_Proxy': MLPClassifier(hidden_layer_sizes=(100, 50), max_iter=300, random_state=42) # Proxy for Deep Learning
    }
    
    for name, model in models.items():
        print(f"Training {name}...")
        model.fit(X_vec, y)
        model_path = os.path.join(MODELS_DIR, f'{name}_model.pkl')
        joblib.dump(model, model_path)
        print(f"Saved {name} to {model_path}")

if __name__ == "__main__":
    print("Starting model training pipeline...")
    train_models()
    print("All models trained and saved successfully!")
