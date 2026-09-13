export type RiskLevel = 'LOW' | 'HIGH' | 'CRITICAL';

export interface DistrictProperties {
  name: string;
  state: string;
  station_id: string;
  risk_level: RiskLevel;
  probability: number;
}

export interface DistrictFeature {
  type: 'Feature';
  properties: DistrictProperties;
  geometry: GeoJSON.Geometry;
}

export interface DistrictGeoJSON {
  type: 'FeatureCollection';
  features: DistrictFeature[];
}

export interface SensorReading {
  timestamp: string;
  rainfall_mm: number;
  soil_moisture_pct: number;
}

export interface SensorResponse {
  station_id: string;
  district: string;
  readings: SensorReading[];
}

export interface FieldReport {
  id: number;
  latitude: number;
  longitude: number;
  description: string;
  photo_url: string | null;
  created_at: string;
}

export interface ActiveAlert {
  district: string;
  district_name?: string;
  risk_level: RiskLevel;
  probability: number;
}

export interface AlertRequest {
  district: string;
  risk_level: RiskLevel;
  phone_number: string;
  language?: string;
}

export interface AlertResponse {
  success: boolean;
  message: string;
  alert_id: number | null;
}
