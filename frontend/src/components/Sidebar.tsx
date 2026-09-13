import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useActiveAlerts, useSendAlert, useRiskZones } from '../api/hooks';
import SensorChart from './SensorChart';
import toast from 'react-hot-toast';
import type { DistrictProperties, RiskLevel } from '../types';
import {
  ShieldAlert,
  AlertTriangle,
  ShieldCheck,
  Send,
  X,
  MapPin,
  Phone,
  Radio,
  FileText,
  ChevronRight,
  Activity,
  CheckCircle2,
} from 'lucide-react';

interface SidebarProps {
  selectedDistrict: DistrictProperties | null;
  onDistrictSelect: (district: DistrictProperties) => void;
  onClose: () => void;
}

export default function Sidebar({ selectedDistrict, onDistrictSelect, onClose }: SidebarProps) {
  const { t, i18n } = useTranslation();
  const { data: alerts } = useActiveAlerts();
  const { data: zones } = useRiskZones();
  const sendAlert = useSendAlert();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [isAlertFormOpen, setIsAlertFormOpen] = useState(false);

  const handleSendAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDistrict || !phoneNumber.trim()) {
      toast.error('Please specify a recipient mobile number');
      return;
    }

    sendAlert.mutate(
      {
        district: selectedDistrict.name,
        risk_level: selectedDistrict.risk_level as RiskLevel,
        phone_number: phoneNumber.trim(),
        language: i18n.language.slice(0, 2),
      },
      {
        onSuccess: () => {
          toast.success(t('alert_sent'));
          setIsAlertFormOpen(false);
          setPhoneNumber('');
        },
        onError: (err) => {
          toast.error(`${t('alert_failed')}: ${err.message}`);
        },
      }
    );
  };

  const criticalAlerts = alerts?.filter((a) => a.risk_level === 'CRITICAL') || [];
  const highAlerts = alerts?.filter((a) => a.risk_level === 'HIGH') || [];

  return (
    <aside className="sidebar-intel-panel">
      {/* Selected District Details */}
      {selectedDistrict ? (
        <div className="district-intel-view">
          {/* Top Bar with Close */}
          <div className="intel-header">
            <div className="intel-title-block">
              <div className="intel-state-row">
                <MapPin size={13} className="text-cyan" />
                <span className="intel-state-name">{selectedDistrict.state}</span>
                <span className="station-code-chip">{selectedDistrict.station_id}</span>
              </div>
              <h2 className="intel-district-name">{selectedDistrict.name}</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="intel-close-btn"
              title={t('close')}
            >
              <X size={17} />
            </button>
          </div>

          {/* Threat Meter Banner */}
          <div className={`threat-banner-card ${selectedDistrict.risk_level.toLowerCase()}`}>
            <div className="threat-banner-top">
              <div className="threat-badge">
                {selectedDistrict.risk_level === 'CRITICAL' ? (
                  <ShieldAlert size={16} />
                ) : selectedDistrict.risk_level === 'HIGH' ? (
                  <AlertTriangle size={16} />
                ) : (
                  <ShieldCheck size={16} />
                )}
                <span>{t(selectedDistrict.risk_level.toLowerCase())} Risk</span>
              </div>
              <div className="threat-percent">
                {((selectedDistrict.probability || 0) * 100).toFixed(1)}% Hazard
              </div>
            </div>

            {/* Probability Progress Bar */}
            <div className="probability-track">
              <div
                className="probability-fill"
                style={{
                  width: `${Math.min(100, Math.max(5, (selectedDistrict.probability || 0) * 100))}%`,
                }}
              />
            </div>
          </div>

          {/* Sensor Telemetry Chart */}
          <SensorChart
            stationId={selectedDistrict.station_id}
            districtName={selectedDistrict.name}
          />

          {/* Emergency Alert Dispatch Section */}
          <div className="alert-dispatch-card">
            <div className="dispatch-header">
              <div className="dispatch-title">
                <Radio size={14} className="text-rose" />
                <span>Twilio Early Warning Dispatch</span>
              </div>
              <span className="dispatch-tag">SMS Gateway</span>
            </div>

            {!isAlertFormOpen ? (
              <button
                type="button"
                onClick={() => setIsAlertFormOpen(true)}
                className={`trigger-alert-btn ${selectedDistrict.risk_level.toLowerCase()}`}
              >
                <Send size={14} />
                <span>{t('dispatch_sms')}</span>
              </button>
            ) : (
              <form onSubmit={handleSendAlert} className="dispatch-form">
                <div className="input-group">
                  <span className="input-prefix">
                    <Phone size={13} />
                  </span>
                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    className="dispatch-input"
                    autoFocus
                  />
                </div>

                {/* SMS Text Preview */}
                <div className="sms-preview-bubble">
                  <div className="sms-preview-title">
                    <FileText size={12} />
                    <span>{t('sms_preview')}</span>
                  </div>
                  <p className="sms-preview-text">
                    ALERT: {selectedDistrict.risk_level} landslide risk in {selectedDistrict.name}. Evacuate vulnerable slopes immediately.
                  </p>
                </div>

                <div className="dispatch-actions">
                  <button
                    type="submit"
                    disabled={sendAlert.isPending}
                    className="confirm-dispatch-btn"
                  >
                    <Send size={14} />
                    <span>{sendAlert.isPending ? 'Broadcasting...' : t('send_alert')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAlertFormOpen(false)}
                    className="cancel-dispatch-btn"
                  >
                    {t('close')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : (
        /* Tactical Overview when no district is selected */
        <div className="tactical-overview-view">
          <div className="overview-hero">
            <div className="overview-icon-ring">
              <Activity size={24} className="text-cyan" />
            </div>
            <h3>Command Overview</h3>
            <p>{t('select_district')}</p>
          </div>

          {/* Quick Stats Grid */}
          <div className="quick-stats-grid">
            <div className="quick-stat-box red">
              <span className="quick-stat-count">{criticalAlerts.length}</span>
              <span className="quick-stat-lbl">Critical Zones</span>
            </div>
            <div className="quick-stat-box amber">
              <span className="quick-stat-count">{highAlerts.length}</span>
              <span className="quick-stat-lbl">High Alerts</span>
            </div>
            <div className="quick-stat-box green">
              <span className="quick-stat-count">
                {(zones?.features?.length || 12) - criticalAlerts.length - highAlerts.length}
              </span>
              <span className="quick-stat-lbl">Stable Zones</span>
            </div>
          </div>

          {/* Monitored District Feed */}
          <div className="districts-feed-card">
            <div className="feed-header">
              <span>{t('monitored_districts')}</span>
              <span className="feed-count">{zones?.features?.length || 12} Nodes</span>
            </div>
            <div className="districts-list-scroll">
              {zones?.features?.map((f) => {
                const p = f.properties;
                return (
                  <div
                    key={p.name}
                    className={`district-list-row ${p.risk_level.toLowerCase()}`}
                    onClick={() => onDistrictSelect(p)}
                  >
                    <div className="district-row-info">
                      <span className="district-row-name">{p.name}</span>
                      <span className="district-row-state">{p.state}</span>
                    </div>
                    <div className="district-row-risk">
                      <span className={`risk-pill ${p.risk_level.toLowerCase()}`}>
                        {p.risk_level}
                      </span>
                      <ChevronRight size={14} className="text-muted" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Active Threat Matrix List (Bottom Section) */}
      <div className="threat-matrix-section">
        <div className="threat-matrix-header">
          <div className="matrix-title">
            <ShieldAlert size={14} className="text-rose" />
            <span>{t('active_threats')}</span>
          </div>
          <span className="matrix-count">
            {(alerts?.length || 0)} Active
          </span>
        </div>

        {alerts && alerts.length > 0 ? (
          <div className="threat-items-scroll">
            {alerts.map((alert) => {
              const districtName = alert.district || alert.district_name || 'District';
              const targetFeature = zones?.features?.find(
                (f) => f.properties.name.toLowerCase() === districtName.toLowerCase()
              );

              return (
                <div
                  key={districtName}
                  className={`threat-item-card ${alert.risk_level.toLowerCase()}`}
                  onClick={() => {
                    if (targetFeature) onDistrictSelect(targetFeature.properties);
                  }}
                >
                  <div className="threat-item-left">
                    <span className="threat-pulse-dot" />
                    <div>
                      <div className="threat-item-district">{districtName}</div>
                      <div className="threat-item-sub">
                        Hazard Probability: {((alert.probability || 0) * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                  <span className={`threat-tag ${alert.risk_level.toLowerCase()}`}>
                    {alert.risk_level}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-threats-card">
            <CheckCircle2 size={16} className="text-emerald" />
            <span>{t('no_alerts')}</span>
          </div>
        )}
      </div>
    </aside>
  );
}
