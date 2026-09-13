import { useTranslation } from 'react-i18next';
import Logo from './Logo';
import { Radio, AlertTriangle, Camera, Globe, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useActiveAlerts, useRiskZones } from '../api/hooks';

interface HeaderProps {
  onOpenReportModal: () => void;
}

const LANGUAGES = [
  { code: 'en', label: 'EN', title: 'English' },
  { code: 'hi', label: 'HI', title: 'हिन्दी' },
  { code: 'as', label: 'AS', title: 'অসমীয়া' },
];

export default function Header({ onOpenReportModal }: HeaderProps) {
  const { t, i18n } = useTranslation();
  const { data: alerts } = useActiveAlerts();
  const { data: zones } = useRiskZones();

  const criticalCount = alerts?.filter((a) => a.risk_level === 'CRITICAL').length || 0;
  const highCount = alerts?.filter((a) => a.risk_level === 'HIGH').length || 0;
  const totalCount = zones?.features?.length || 12;

  return (
    <header className="header-container">
      {/* Brand & Logo */}
      <div className="header-left">
        <Logo size={40} showText={true} />
      </div>

      {/* Center Operational Telemetry Bar */}
      <div className="header-center">
        <div className="telemetry-pill">
          <span className="live-beacon">
            <span className="live-beacon-dot" />
            <span className="live-beacon-ping" />
          </span>
          <Radio size={14} className="telemetry-icon" />
          <span className="telemetry-label">{t('live_status')}</span>
          <span className="telemetry-divider">/</span>
          <span className="telemetry-value">{totalCount} Districts</span>
        </div>

        {criticalCount > 0 ? (
          <div className="threat-pill critical">
            <ShieldAlert size={14} />
            <span>
              {criticalCount} {t('critical')}
            </span>
          </div>
        ) : (
          <div className="threat-pill stable">
            <CheckCircle2 size={14} />
            <span>{t('normal_zones')}</span>
          </div>
        )}

        {highCount > 0 && (
          <div className="threat-pill warning">
            <AlertTriangle size={14} />
            <span>
              {highCount} {t('high')}
            </span>
          </div>
        )}
      </div>

      {/* Right Controls: Language & Action */}
      <div className="header-right">
        {/* Language Selector */}
        <div className="language-selector">
          <Globe size={15} className="lang-icon" />
          <div className="lang-pills">
            {LANGUAGES.map((lang) => {
              const isActive = i18n.language.startsWith(lang.code);
              return (
                <button
                  key={lang.code}
                  type="button"
                  title={lang.title}
                  onClick={() => i18n.changeLanguage(lang.code)}
                  className={`lang-btn ${isActive ? 'active' : ''}`}
                >
                  {lang.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Field Report Button */}
        <button
          type="button"
          onClick={onOpenReportModal}
          className="report-incident-btn"
          title={t('submit_report')}
        >
          <Camera size={15} />
          <span>{t('submit_report')}</span>
        </button>
      </div>
    </header>
  );
}
