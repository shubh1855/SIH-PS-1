import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { useRiskZones } from '../api/hooks';
import type { DistrictProperties } from '../types';
import type { Layer, LeafletMouseEvent } from 'leaflet';
import 'leaflet/dist/leaflet.css';

const RISK_COLORS: Record<string, string> = {
  LOW: '#22c55e',
  HIGH: '#f97316',
  CRITICAL: '#ef4444',
};

const NER_CENTER: [number, number] = [26.0, 93.0];

interface MapViewProps {
  onDistrictSelect: (properties: DistrictProperties) => void;
}

export default function MapView({ onDistrictSelect }: MapViewProps) {
  const { data: geoJson, isLoading } = useRiskZones();

  const getStyle = (feature: GeoJSON.Feature | undefined) => {
    const riskLevel = feature?.properties?.risk_level || 'LOW';
    return {
      fillColor: RISK_COLORS[riskLevel] || '#94a3b8',
      weight: 2,
      opacity: 1,
      color: '#334155',
      fillOpacity: 0.5,
    };
  };

  const onEachFeature = (feature: GeoJSON.Feature, layer: Layer) => {
    const props = feature.properties as DistrictProperties;

    // Tooltip on hover
    layer.bindTooltip(
      `<strong>${props.name}</strong><br/>
       ${props.state}<br/>
       Risk: ${props.risk_level}`,
      { sticky: true }
    );

    // Click to select
    layer.on({
      click: (_e: LeafletMouseEvent) => {
        onDistrictSelect(props);
      },
    });
  };

  if (isLoading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Loading map...
      </div>
    );
  }

  return (
    <MapContainer
      center={NER_CENTER}
      zoom={7}
      style={{ flex: 1, minHeight: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {geoJson && (
        <GeoJSON
          key={JSON.stringify(geoJson)}
          data={geoJson}
          style={getStyle}
          onEachFeature={onEachFeature}
        />
      )}
    </MapContainer>
  );
}
