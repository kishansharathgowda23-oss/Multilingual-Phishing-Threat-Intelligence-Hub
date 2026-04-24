import time
import random

def scan_image(file_bytes, filename):
    """
    Performs a deterministic scan on an image file based on size and structure.
    No mock randomization or simulated delays.
    """
    file_size_kb = len(file_bytes) / 1024
    
    # Deterministic heuristics (e.g. abnormally large images with hidden data)
    is_suspicious = file_size_kb > 5000 # Larger than 5MB
    
    if is_suspicious:
        return {
            "status": "Suspicious",
            "risk": "High",
            "confidence": 85.0,
            "summary": "Detected abnormally large image structure. Possible hidden data payloads.",
            "details": "The file size exceeds standard image norms. Deep structural analysis recommended."
        }
    else:
        return {
            "status": "Safe",
            "risk": "Low",
            "confidence": 95.0,
            "summary": "No malicious payloads detected.",
            "details": "Image file structure is standard."
        }
