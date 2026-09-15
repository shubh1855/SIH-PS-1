import numpy as np
from datetime import datetime, timedelta, timezone

NER_STATIONS = {
    "station_01": "Kamrup Metropolitan",
    "station_02": "East Khasi Hills",
    "station_03": "Aizawl",
    "station_04": "Kohima",
    "station_05": "Imphal West",
    "station_06": "West Tripura",
    "station_07": "Papum Pare",
    "station_08": "Lunglei",
    "station_09": "West Garo Hills",
    "station_10": "North Sikkim",
    "station_11": "Dibrugarh",
    "station_12": "East Siang",
}

def generate_sensor_data(station_id: str, hours: int = 48) -> list[dict]:
    now = datetime.now(timezone.utc)
    data = []
    
    # Base pattern
    for i in range(hours):
        dt = now - timedelta(hours=hours - i)
        
        # Simulated diurnal rainfall pattern + noise
        hour_of_day = dt.hour
        base_rain = 5 * np.sin(np.pi * hour_of_day / 12) ** 2
        noise = np.random.normal(0, 2)
        rainfall_mm = max(0.0, base_rain + noise)
        
        # Soil moisture is somewhat correlated with accumulated rainfall
        soil_moisture_pct = min(100.0, 40 + (rainfall_mm * 1.5) + np.random.normal(0, 5))
        
        # Inject danger spike for specific stations in the last 12 hours
        if i >= hours - 12:
            if station_id == 'station_06':
                # CRITICAL risk (rain >= 65)
                rainfall_mm += np.random.uniform(70, 90)
                soil_moisture_pct += np.random.uniform(30, 45)
            elif station_id == 'station_07':
                # HIGH risk (rain >= 35, but misses CRITICAL limits)
                rainfall_mm += np.random.uniform(35, 45)
                soil_moisture_pct = min(74.0, soil_moisture_pct + np.random.uniform(10, 20))
            
        rainfall_mm = max(0.0, rainfall_mm)
        soil_moisture_pct = min(100.0, max(0.0, soil_moisture_pct))
        
        data.append({
            "timestamp": dt.isoformat(),
            "rainfall_mm": float(rainfall_mm),
            "soil_moisture_pct": float(soil_moisture_pct)
        })
        
    return data
