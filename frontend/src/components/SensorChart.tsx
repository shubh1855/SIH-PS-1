import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useSensorData } from '../api/hooks';
import { useTranslation } from 'react-i18next';
import { CloudRain, Droplets, Activity } from 'lucide-react';

interface SensorChartProps {
  stationId: string;
  districtName: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-custom-tooltip">
        <div className="tooltip-time">{label}</div>
        <div className="tooltip-row rain">
          <CloudRain size={13} />
          <span>Rainfall:</span>
          <strong>{payload[0]?.value} mm</strong>
        </div>
        <div className="tooltip-row moisture">
          <Droplets size={13} />
          <span>Moisture:</span>
          <strong>{payload[1]?.value}%</strong>
        </div>
      </div>
    );
  }
  return null;
};

export default function SensorChart({ stationId, districtName }: SensorChartProps) {
  const { t } = useTranslation();
  const { data, isLoading } = useSensorData(stationId);

  if (isLoading) {
    return (
      <div className="chart-loading-box">
        <div className="chart-skeleton-pulse" />
        <span>Synchronizing telemetry stream...</span>
      </div>
    );
  }

  if (!data || !data.readings || data.readings.length === 0) {
    return (
      <div className="chart-empty-box">
        <Activity size={18} className="text-muted" />
        <span>Station offline or telemetry missing</span>
      </div>
    );
  }

  const readings = data.readings;
  const chartData = readings.map((r) => {
    const d = new Date(r.timestamp);
    return {
      time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      rawTime: r.timestamp,
      rainfall_mm: Number(r.rainfall_mm.toFixed(1)),
      soil_moisture_pct: Number(r.soil_moisture_pct.toFixed(1)),
    };
  });

  // Calculate telemetry metrics
  const maxRainfall = Math.max(...readings.map((r) => r.rainfall_mm)).toFixed(1);
  const maxMoisture = Math.max(...readings.map((r) => r.soil_moisture_pct)).toFixed(1);
  const latestReading = readings[readings.length - 1];

  return (
    <div className="sensor-chart-card">
      <div className="chart-header">
        <div className="chart-title-group">
          <span className="chart-subhead">{t('sensor_data')}</span>
          <span className="chart-district">{districtName}</span>
        </div>
        <span className="chart-station-badge">{stationId}</span>
      </div>

      {/* Telemetry Metrics Bar */}
      <div className="telemetry-stats-row">
        <div className="stat-pill rain">
          <CloudRain size={13} />
          <span>Peak Rain:</span>
          <strong>{maxRainfall} mm</strong>
        </div>
        <div className="stat-pill moisture">
          <Droplets size={13} />
          <span>Peak Saturation:</span>
          <strong>{maxMoisture}%</strong>
        </div>
        {latestReading && (
          <div className="stat-pill current">
            <span>Now:</span>
            <strong>{latestReading.rainfall_mm.toFixed(1)} mm</strong>
          </div>
        )}
      </div>

      {/* Recharts Dual-Line Telemetry Chart */}
      <div className="chart-canvas-wrapper">
        <ResponsiveContainer width="100%" height={210}>
          <LineChart data={chartData} margin={{ top: 12, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="rainStroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
              <linearGradient id="moistureStroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#9333ea" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.07)" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: '#64748b' }}
              interval="preserveStartEnd"
              tickLine={false}
              axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
              domain={[0, 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="rainfall_mm"
              name={t('rainfall')}
              stroke="url(#rainStroke)"
              dot={false}
              strokeWidth={2.2}
              activeDot={{ r: 5, fill: '#38bdf8', stroke: '#0f172a', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="soil_moisture_pct"
              name={t('soil_moisture')}
              stroke="url(#moistureStroke)"
              dot={false}
              strokeWidth={2.2}
              activeDot={{ r: 5, fill: '#c084fc', stroke: '#0f172a', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-legend-footer">
        <div className="legend-indicator">
          <span className="legend-dot rain" />
          <span>{t('rainfall')}</span>
        </div>
        <div className="legend-indicator">
          <span className="legend-dot moisture" />
          <span>{t('soil_moisture')}</span>
        </div>
        <span className="legend-window">48h Window · 1h Sample</span>
      </div>
    </div>
  );
}
