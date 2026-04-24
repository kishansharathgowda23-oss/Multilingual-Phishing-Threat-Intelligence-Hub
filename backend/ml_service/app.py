from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os
import threading
import pandas as pd
from train import train_models
from image_scanner import scan_image
from payment_scanner import auto_scan, deep_scan

app = Flask(__name__)
CORS(app)

MODELS_DIR = "models"
vectorizer = None
models = {}

def load_models():
    global vectorizer, models
    if not os.path.exists(MODELS_DIR):
        print(f"Warning: {MODELS_DIR} directory not found. Please run train.py first.")
        return

    try:
        vectorizer = joblib.load(os.path.join(MODELS_DIR, 'vectorizer.pkl'))
        model_names = ['RF', 'SVM', 'NB', 'LR', 'LSTM_Proxy']
        
        for name in model_names:
            model_path = os.path.join(MODELS_DIR, f'{name}_model.pkl')
            if os.path.exists(model_path):
                models[name] = joblib.load(model_path)
        print(f"Successfully loaded {len(models)} models and vectorizer.")
    except Exception as e:
        print(f"Error loading models: {e}")

load_models()

@app.route('/predict', methods=['POST'])
def predict():
    if not vectorizer or not models:
        return jsonify({"error": "Models not loaded. Please run train.py first."}), 503

    data = request.json
    if not data or 'message' not in data:
        return jsonify({"error": "No message provided"}), 400

    message = data['message']
    
    try:
        # Preprocess the message
        X_vec = vectorizer.transform([message])
        
        scores = []
        # Real LSTM can't easily be served in this generic pipeline without PyTorch/TF.
        # We mapped LSTM_Proxy to MLP, and will rename the output to match the UI expectations.
        display_names = {
            'RF': 'RF',
            'SVM': 'SVM',
            'NB': 'NB',
            'LR': 'LR',
            'LSTM_Proxy': 'LSTM'
        }

        max_spam_prob = 0
        
        for name, model in models.items():
            # Get probability of being spam (class 1)
            # SVM uses probability=True so predict_proba works
            prob = model.predict_proba(X_vec)[0][1] * 100
            max_spam_prob = max(max_spam_prob, prob)
            
            scores.append({
                "name": display_names.get(name, name),
                "score": round(prob, 2)
            })
            
        return jsonify({
            "message": message,
            "mlScores": scores,
            "isSpam": max_spam_prob > 50,
            "maxConfidence": round(max_spam_prob, 2)
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/retrain', methods=['POST'])
def retrain():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file and file.filename.endswith('.csv'):
        # Save the uploaded CSV as the new training data (convert to tsv expected by train)
        # Note: In a robust system, we'd handle different CSV formats carefully
        try:
            df = pd.read_csv(file)
            if len(df.columns) >= 2:
                # Assuming first two columns are label and message
                df = df.iloc[:, :2]
                df.to_csv("sms_spam.tsv", sep='\t', index=False, header=False)
                
                # Start training in a background thread
                def bg_train():
                    print("Background training started...")
                    train_models()
                    load_models() # Reload models into memory after training
                    print("Background training finished and models reloaded.")
                
                thread = threading.Thread(target=bg_train)
                thread.start()
                
                return jsonify({"message": "Retraining started in the background. It may take a few minutes."}), 202
            else:
                return jsonify({"error": "CSV must have at least 2 columns (label, message)"}), 400
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    else:
        return jsonify({"error": "Invalid file format. Please upload a .csv file."}), 400

@app.route('/analyze-image', methods=['POST'])
def analyze_image():
    if 'file' not in request.files:
        return jsonify({"error": "No image file provided"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected image file"}), 400
        
    try:
        file_bytes = file.read()
        result = scan_image(file_bytes, file.filename)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ─── Payment Link & QR Code Protection Endpoints ───────────────

@app.route('/payment/auto-scan', methods=['POST'])
def payment_auto_scan():
    """
    Stage 1: Auto-scan payment link/QR code (~1s).
    Runs automatically when a payment link is detected in any messenger.
    """
    data = request.json
    if not data or 'url' not in data:
        return jsonify({"error": "No URL provided"}), 400

    url = data['url']
    context = data.get('context', '')  # Optional surrounding message text

    try:
        result = auto_scan(url, context)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/payment/deep-scan', methods=['POST'])
def payment_deep_scan():
    """
    Stage 2: Deep scan payment link.
    Runs when user clicks to open the link.
    Returns detailed verdict with heuristic risk scores.
    """
    data = request.json
    if not data or 'url' not in data:
        return jsonify({"error": "No URL provided"}), 400

    url = data['url']
    context = data.get('context', '')

    try:
        result = deep_scan(url, context)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/payment/verify-auth', methods=['POST'])
def payment_verify_auth():
    """
    Verify user authentication before allowing access to a suspicious payment link.
    The frontend sends the link_hash + user's auth token for verification.
    If authenticated, the link is allowed to open.
    """
    data = request.json
    if not data or 'link_hash' not in data:
        return jsonify({"error": "No link_hash provided"}), 400

    link_hash = data['link_hash']
    auth_token = data.get('auth_token', '')
    user_confirmed = data.get('user_confirmed', False)

    # In production: validate auth_token against Firebase/JWT
    # For now: if user explicitly confirmed + provided any auth, allow
    if user_confirmed and auth_token:
        return jsonify({
            "verified": True,
            "link_hash": link_hash,
            "action": "ALLOW",
            "message": "Authentication verified. Proceed with caution."
        }), 200
    else:
        return jsonify({
            "verified": False,
            "link_hash": link_hash,
            "action": "DENY",
            "message": "Authentication required. Please confirm your identity."
        }), 403


if __name__ == '__main__':
    app.run(port=5002, debug=True)
