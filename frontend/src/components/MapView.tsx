import { useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useRiskZones, useReports } from '../api/hooks';
import type { DistrictProperties } from '../types';
import type { Layer, LeafletMouseEvent } from 'leaflet';
import { ShieldAlert, AlertTriangle, ShieldCheck, Camera, Layers, MapPin, Clock } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const RISK_CONFIG: Record<string, { fill: string; stroke: string; label: string; glow: string }> = {
  LOW: {
    fill: 'rgba(34, 197, 94, 0.45)',
    stroke: '#22c55e',
    label: 'Low Risk',
    glow: 'rgba(34, 197, 94, 0.6)',
  },
  HIGH: {
    fill: 'rgba(249, 115, 22, 0.55)',
    stroke: '#f97316',
    label: 'High Risk',
    glow: 'rgba(249, 115, 22, 0.7)',
  },
  CRITICAL: {
    fill: 'rgba(239, 68, 68, 0.65)',
    stroke: '#ef4444',
    label: 'Critical Hazard',
    glow: 'rgba(239, 68, 68, 0.9)',
  },
};

const NER_CENTER: [number, number] = [26.0, 93.0];

// Custom HTML DivIcon for Field Reports (No emojis, sleek radar beacon style)
const createFieldReportIcon = (hasPhoto: boolean) =>
  L.divIcon({
    className: 'leaflet-custom-div-icon',
    html: `
      <div class="field-incident-pin ${hasPhoto ? 'has-photo' : ''}">
        <div class="pin-ring"></div>
        <div class="pin-core">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
            <circle cx="12" cy="13" r="3"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 28],
    popupAnchor: [0, -28],
  });

interface MapViewProps {
  onDistrictSelect: (properties: DistrictProperties) => void;
  selectedDistrict: DistrictProperties | null;
}

export default function MapView({ onDistrictSelect, selectedDistrict }: MapViewProps) {
  const { data: geoJson, isLoading: isZonesLoading } = useRiskZones();
  const { data: reports } = useReports();
  const [filterRisk, setFilterRisk] = useState<'ALL' | 'CRITICAL' | 'HIGH'>('ALL');
  const [tileMode, setTileMode] = useState<'voyager' | 'dark'>('dark');
  const [showIncidents, setShowIncidents] = useState(true);
  const geoJsonVersion = useRef(0);
  const prevGeoJson = useRef(geoJson);
  if (geoJson !== prevGeoJson.current) {
    geoJsonVersion.current += 1;
    prevGeoJson.current = geoJson;
  }

  const validReports =
    reports?.filter(
      (report) =>
        report.latitude != null &&
        report.longitude != null &&
        !isNaN(report.latitude) &&
        !isNaN(report.longitude)
    ) || [];

  const getStyle = (feature: GeoJSON.Feature | undefined) => {
    const riskLevel = feature?.properties?.risk_level || 'LOW';
    const isSelected = selectedDistrict && selectedDistrict.name === feature?.properties?.name;
    const config = RISK_CONFIG[riskLevel] || RISK_CONFIG.LOW;

    const isFilteredOut =
      filterRisk === 'CRITICAL'
        ? riskLevel !== 'CRITICAL'
        : filterRisk === 'HIGH'
        ? riskLevel === 'LOW'
        : false;

    return {
      fillColor: config.fill,
      weight: isSelected ? 3.5 : 1.8,
      opacity: isFilteredOut ? 0.2 : 0.9,
      color: isSelected ? '#ffffff' : config.stroke,
      fillOpacity: isFilteredOut ? 0.08 : isSelected ? 0.75 : 0.45,
      dashArray: isSelected ? '4 2' : undefined,
    };
  };

  const onEachFeature = (feature: GeoJSON.Feature, layer: Layer) => {
    const props = feature.properties as DistrictProperties;
    const config = RISK_CONFIG[props.risk_level] || RISK_CONFIG.LOW;
    const probPct = Math.round((props.probability || 0) * 100);

    // Rich custom tooltip
    layer.bindTooltip(
      `
      <div class="map-tooltip-content">
        <div class="map-tooltip-header">
          <strong>${props.name}</strong>
          <span class="map-tooltip-state">${props.state}</span>
        </div>
        <div class="map-tooltip-badge ${props.risk_level.toLowerCase()}">
          ${config.label} · ${probPct}%
        </div>
      </div>
      `,
      {
        sticky: true,
        direction: 'top',
        className: 'custom-map-tooltip',
      }
    );

    layer.on({
      mouseover: (e: LeafletMouseEvent) => {
        const l = e.target;
        l.setStyle({
          weight: 3,
          color: '#ffffff',
          fillOpacity: 0.65,
        });
        l.bringToFront();
      },
      mouseout: (e: LeafletMouseEvent) => {
        const l = e.target;
        l.setStyle(getStyle(feature));
      },
      click: () => {
        onDistrictSelect(props);
      },
    });
  };

  const tileUrl =
    tileMode === 'dark'
      ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

  const tileAttribution =
    tileMode === 'dark'
      ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      : 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  return (
    <div className="map-view-wrapper">
      {isZonesLoading && (
        <div className="map-loading-overlay">
          <div className="map-spinner" />
          <span>Synchronizing Geospatial Risk Layer...</span>
        </div>
      )}

      <MapContainer
        center={NER_CENTER}
        zoom={7}
        minZoom={6}
        maxZoom={12}
        className={`map-container-root ${tileMode === 'dark' ? 'map-dark-mode' : ''}`}
      >
        <TileLayer attribution={tileAttribution} url={tileUrl} className={tileMode === 'dark' ? 'map-tiles-dark' : ''} />

        {/* District Hazard Boundary Circles */}
        {geoJson && (
          <GeoJSON
            key={`geo-v${geoJsonVersion.current}-${filterRisk}-${selectedDistrict?.name}-${tileMode}`}
            data={geoJson}
            style={getStyle}
            onEachFeature={onEachFeature}
            pointToLayer={(feature, latlng) => {
              const radius = feature.properties?.radius_meters || 20000;
              return L.circle(latlng, { radius: radius });
            }}
          />
        )}

        {/* Field Officer Incident Report Markers */}
        {showIncidents && validReports.map((report) => {
            const photoSrc = report.photo_url
              ? report.photo_url.startsWith('http')
                ? report.photo_url
                : `${apiBaseUrl}${report.photo_url}`
              : null;

            return (
              <Marker
                key={report.id}
                position={[report.latitude, report.longitude]}
                icon={createFieldReportIcon(!!photoSrc)}
              >
                <Popup className="incident-popup-custom">
                  <div className="incident-popup-card">
                    <div className="incident-popup-header">
                      <div className="incident-popup-badge">
                        <Camera size={13} />
                        <span>Field Incident #{report.id}</span>
                      </div>
                      <span className="incident-popup-time">
                        <Clock size={11} />
                        {new Date(report.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {photoSrc && (
                      <div className="incident-popup-img-wrapper">
                        <img
                          src={photoSrc}
                          alt="Incident site evidence"
                          className="incident-popup-img"
                        />
                      </div>
                    )}

                    <p className="incident-popup-desc">{report.description}</p>

                    <div className="incident-popup-coords">
                      <MapPin size={12} />
                      <span>
                        {report.latitude.toFixed(4)}°N, {report.longitude.toFixed(4)}°E
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>

      {/* Map Control Floating Toolbar (Top-Right) */}
      <div className="map-toolbar">
        <button
          type="button"
          onClick={() => setTileMode(tileMode === 'dark' ? 'voyager' : 'dark')}
          className="map-tool-btn"
          title="Toggle Map Style"
        >
          <Layers size={15} />
          <span>{tileMode === 'dark' ? 'Dark Tactical' : 'Terrain Sat'}</span>
        </button>
      </div>

      {/* Map Interactive Legend & Threat Filter (Bottom-Left) */}
      <div className="map-legend-card">
        <div className="legend-header">
          <span className="legend-title">Hazard Severity Index</span>
          <span className="legend-cycle">15m Refresh</span>
        </div>

        <div className="legend-items">
          <div
            className={`legend-item ${filterRisk === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilterRisk('ALL')}
          >
            <span className="legend-swatch low" />
            <ShieldCheck size={13} className="text-emerald" />
            <span>Low (Stable)</span>
          </div>

          <div
            className={`legend-item ${filterRisk === 'HIGH' ? 'active' : ''}`}
            onClick={() => setFilterRisk(filterRisk === 'HIGH' ? 'ALL' : 'HIGH')}
          >
            <span className="legend-swatch high" />
            <AlertTriangle size={13} className="text-amber" />
            <span>High Risk</span>
          </div>

          <div
            className={`legend-item ${filterRisk === 'CRITICAL' ? 'active' : ''}`}
            onClick={() => setFilterRisk(filterRisk === 'CRITICAL' ? 'ALL' : 'CRITICAL')}
          >
            <span className="legend-swatch critical" />
            <ShieldAlert size={13} className="text-rose" />
            <span>Critical Alert</span>
          </div>

          {validReports.length > 0 && (
            <div 
              className={`legend-item report-legend ${showIncidents ? 'active' : ''}`}
              onClick={() => setShowIncidents(!showIncidents)}
            >
              <span className="legend-pin" />
              <Camera size={13} className="text-cyan" />
              <span>Incidents ({validReports.length})</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
