import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useActiveAlerts, useSendAlert } from '../api/hooks';
import SensorChart from './SensorChart';
import toast from 'react-hot-toast';
import type { DistrictProperties, RiskLevel } from '../types';

const RISK_BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  LOW: { bg: '#166534', text: '#bbf7d0' },
  HIGH: { bg: '#9a3412', text: '#fed7aa' },
  CRITICAL: { bg: '#991b1b', text: '#fecaca' },
};

interface SidebarProps {
  selectedDistrict: DistrictProperties | null;
  onClose: () => void;
}

export default function Sidebar({ selectedDistrict, onClose }: SidebarProps) {
  const { t } = useTranslation();
  const { data: alerts } = useActiveAlerts();
  const sendAlert = useSendAlert();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showAlertForm, setShowAlertForm] = useState(false);

  const handleSendAlert = () => {
    if (!selectedDistrict || !phoneNumber) return;
    sendAlert.mutate(
      {
        district: selectedDistrict.name,
        risk_level: selectedDistrict.risk_level as RiskLevel,
        phone_number: phoneNumber,
      },
      {
        onSuccess: () => {
          toast.success(t('alert_sent'));
          setShowAlertForm(false);
          setPhoneNumber('');
        },
        onError: () => {
          toast.error(t('alert_failed'));
        },
      }
    );
  };

  return (
    <aside
      style={{
        width: '380px',
        backgroundColor: '#0f172a',
        color: '#e2e8f0',
        overflowY: 'auto',
        padding: '1rem',
        borderLeft: '1px solid #1e293b',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      {/* Selected District Info */}
      {selectedDistrict ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{selectedDistrict.name}</h2>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#94a3b8' }}>
                {selectedDistrict.state}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '1.25rem',
              }}
            >
              ✕
            </button>
          </div>

          {/* Risk Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span
              style={{
                display: 'inline-block',
                padding: '0.25rem 0.75rem',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                backgroundColor: RISK_BADGE_COLORS[selectedDistrict.risk_level]?.bg || '#334155',
                color: RISK_BADGE_COLORS[selectedDistrict.risk_level]?.text || '#e2e8f0',
              }}
            >
              {t(selectedDistrict.risk_level.toLowerCase())}
            </span>
            <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
              {t('probability')}: {((selectedDistrict.probability || 0) * 100).toFixed(1)}%
            </span>
          </div>

          {/* Sensor Chart */}
          <SensorChart stationId={selectedDistrict.station_id} districtName={selectedDistrict.name} />

          {/* Send Alert */}
          {!showAlertForm ? (
            <button
              onClick={() => setShowAlertForm(true)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              🔔 {t('send_alert')}
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <input
                type="tel"
                placeholder={t('phone_number')}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                style={{
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid #475569',
                  backgroundColor: '#1e293b',
                  color: '#f8fafc',
                  fontSize: '0.875rem',
                }}
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={handleSendAlert}
                  disabled={sendAlert.isPending}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                  }}
                >
                  {sendAlert.isPending ? '...' : t('send_alert')}
                </button>
                <button
                  onClick={() => setShowAlertForm(false)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    backgroundColor: '#334155',
                    color: '#e2e8f0',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                  }}
                >
                  {t('close')}
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748b' }}>
          <p style={{ fontSize: '1rem' }}>📍 {t('select_district')}</p>
        </div>
      )}

      {/* Active Alerts */}
      <div style={{ borderTop: '1px solid #1e293b', paddingTop: '1rem' }}>
        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem' }}>⚠️ {t('active_alerts')}</h3>
        {alerts && alerts.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {alerts.map((alert) => (
              <li
                key={alert.district}
                style={{
                  padding: '0.5rem 0.75rem',
                  backgroundColor: '#1e293b',
                  borderRadius: '6px',
                  borderLeft: `3px solid ${alert.risk_level === 'CRITICAL' ? '#ef4444' : '#f97316'}`,
                  fontSize: '0.875rem',
                }}
              >
                <strong>{alert.district}</strong> — {alert.risk_level} ({(alert.probability * 100).toFixed(0)}%)
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>{t('no_alerts')}</p>
        )}
      </div>
    </aside>
  );
}
