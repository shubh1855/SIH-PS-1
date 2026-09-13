import joblib
import numpy as np

def load_model():
    try:
        return joblib.load('model/landslide_model.joblib')
    except FileNotFoundError:
        return None

def predict_risk(features: dict, model=None) -> dict:
    if model is None:
        # Generate random prediction with weighted probabilities
        choice = np.random.choice(["LOW", "HIGH", "CRITICAL"], p=[0.6, 0.25, 0.15])
        
        if choice == "LOW":
            prob = np.random.uniform(0.0, 0.3)
        elif choice == "HIGH":
            prob = np.random.uniform(0.3, 0.7)
        else:
            prob = np.random.uniform(0.7, 1.0)
            
        return {"risk_level": choice, "probability": prob}
    else:
        # Pseudo code for predict_proba if we had a real model
        # features_array = extract_features(features)
        # proba = model.predict_proba([features_array])[0]
        # class_idx = np.argmax(proba)
        # ...
        pass
    
def batch_predict(districts_features: list[dict], model=None) -> dict:
    results = {}
    for item in districts_features:
        district_name = item.get("district_name")
        features = item.get("features", {})
        pred = predict_risk(features, model)
        results[district_name] = pred
    return results
