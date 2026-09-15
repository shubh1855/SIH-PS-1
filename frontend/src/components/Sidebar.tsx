import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSendAlert } from '../api/hooks';
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
  Activity,
} from 'lucide-react';

interface SidebarProps {
  selectedDistrict: DistrictProperties | null;
  onDistrictSelect: (district: DistrictProperties) => void;
  onClose: () => void;
}

export default function Sidebar({ selectedDistrict, onDistrictSelect, onClose }: SidebarProps) {
  const { t, i18n } = useTranslation();
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

  return (
    <aside className="left-command-panel">
      {/* Selected District Details */}
      <div className="district-intel-view">
        {/* Top Bar with Close */}
        <div className="intel-header">
          <div className="intel-title-block">
            <div className="intel-state-row">
              <MapPin size={13} className="text-cyan" />
              <span className="intel-state-name">{selectedDistrict!.state}</span>
              <span className="station-code-chip">{selectedDistrict!.station_id}</span>
            </div>
            <h2 className="intel-district-name">{selectedDistrict!.name}</h2>
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
        <div className={`threat-banner-card ${selectedDistrict!.risk_level.toLowerCase()}`}>
          <div className="threat-banner-top">
            <div className="threat-badge">
              {selectedDistrict!.risk_level === 'CRITICAL' ? (
                <ShieldAlert size={16} />
              ) : selectedDistrict!.risk_level === 'HIGH' ? (
                <AlertTriangle size={16} />
              ) : (
                <ShieldCheck size={16} />
              )}
              <span>{t(selectedDistrict!.risk_level.toLowerCase())} Risk</span>
            </div>
            <div className="threat-percent">
              {((selectedDistrict!.probability || 0) * 100).toFixed(1)}% Hazard
            </div>
          </div>

          {/* Probability Progress Bar */}
          <div className="probability-track">
            <div
              className="probability-fill"
              style={{
                width: `${Math.min(100, Math.max(5, (selectedDistrict!.probability || 0) * 100))}%`,
              }}
            />
          </div>
        </div>

        {/* Sensor Telemetry Chart */}
        <SensorChart
          stationId={selectedDistrict!.station_id}
          districtName={selectedDistrict!.name}
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
              className={`trigger-alert-btn ${selectedDistrict!.risk_level.toLowerCase()}`}
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
                  ALERT: {selectedDistrict!.risk_level} landslide risk in {selectedDistrict!.name}. Evacuate vulnerable slopes immediately.
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
    </aside>
  );
}
