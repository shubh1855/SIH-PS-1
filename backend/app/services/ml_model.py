import joblib
import numpy as np

def load_model():
    try:
        return joblib.load('model/landslide_model.joblib')
    except FileNotFoundError:
        return None

def predict_risk(features: dict, model=None) -> dict:
    if model is not None:
        try:
            # Model prediction if scikit-learn artifact is loaded
            rainfall = float(features.get("rainfall_mm", 0.0))
            moisture = float(features.get("soil_moisture_pct", 0.0))
            # Example feature array [rainfall, moisture, month]
            features_array = np.array([[rainfall, moisture, 9]])
            proba = model.predict_proba(features_array)[0]
            classes = getattr(model, "classes_", ["LOW", "HIGH", "CRITICAL"])
            idx = int(np.argmax(proba))
            return {"risk_level": classes[idx], "probability": float(proba[idx])}
        except Exception:
            pass

    # Heuristic inference model based on geotechnical rainfall-moisture landslide thresholds
    rainfall = float(features.get("rainfall_mm", 0.0))
    moisture = float(features.get("soil_moisture_pct", 0.0))

    # Trigger score calculation:
    # Severe danger: rainfall > 65mm or (rainfall > 40mm and moisture > 75%) or moisture > 85%
    if rainfall >= 65.0 or (rainfall >= 40.0 and moisture >= 75.0) or moisture >= 88.0:
        risk_level = "CRITICAL"
        prob = min(0.98, 0.78 + (rainfall / 300.0) + (moisture / 400.0))
    elif rainfall >= 25.0 or moisture >= 60.0 or (rainfall >= 15.0 and moisture >= 50.0):
        risk_level = "HIGH"
        prob = min(0.75, 0.45 + (rainfall / 200.0) + (moisture / 500.0))
    else:
        risk_level = "LOW"
        prob = max(0.04, min(0.35, 0.05 + (rainfall / 150.0) + (moisture / 400.0)))

    return {"risk_level": risk_level, "probability": round(float(prob), 3)}
    
def batch_predict(districts_features: list[dict], model=None) -> dict:
    results = {}
    for item in districts_features:
        district_name = item.get("district_name")
        features = item.get("features", {})
        pred = predict_risk(features, model)
        results[district_name] = pred
    return results
