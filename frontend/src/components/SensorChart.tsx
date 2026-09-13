import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useSensorData } from '../api/hooks';
import { useTranslation } from 'react-i18next';

interface SensorChartProps {
  stationId: string;
  districtName: string;
}

export default function SensorChart({ stationId, districtName }: SensorChartProps) {
  const { t } = useTranslation();
  const { data, isLoading } = useSensorData(stationId);

  if (isLoading) {
    return <p style={{ padding: '1rem', color: '#94a3b8' }}>{t('loading')}</p>;
  }

  if (!data || !data.readings || data.readings.length === 0) {
    return <p style={{ padding: '1rem', color: '#94a3b8' }}>No sensor data available</p>;
  }

  const chartData = data.readings.map((r) => ({
    time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    rainfall_mm: Number(r.rainfall_mm.toFixed(1)),
    soil_moisture_pct: Number(r.soil_moisture_pct.toFixed(1)),
  }));

  return (
    <div>
      <h4 style={{ margin: '0.5rem 0', fontSize: '0.875rem', color: '#cbd5e1' }}>
        {t('sensor_data')} — {districtName}
      </h4>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            interval="preserveStartEnd"
          />
          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '6px' }}
            labelStyle={{ color: '#f8fafc' }}
          />
          <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
          <Line
            type="monotone"
            dataKey="rainfall_mm"
            name={t('rainfall')}
            stroke="#3b82f6"
            dot={false}
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="soil_moisture_pct"
            name={t('soil_moisture')}
            stroke="#a855f7"
            dot={false}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
