import { useTranslation } from 'react-i18next';
import { useActiveAlerts, useRiskZones } from '../api/hooks';
import type { DistrictProperties } from '../types';
import {
  ShieldAlert,
  AlertTriangle,
  ShieldCheck,
  Activity,
  CheckCircle2,
  ChevronRight,
  X,
} from 'lucide-react';

interface CommandOverviewProps {
  onDistrictSelect: (district: DistrictProperties) => void;
  onClose: () => void;
}

export default function CommandOverview({ onDistrictSelect, onClose }: CommandOverviewProps) {
  const { t } = useTranslation();
  const { data: alerts } = useActiveAlerts();
  const { data: zones } = useRiskZones();

  const criticalCount = zones?.features?.filter((f) => f.properties.risk_level === 'CRITICAL').length || 0;
  const highCount = zones?.features?.filter((f) => f.properties.risk_level === 'HIGH').length || 0;
  const lowCount = zones?.features?.filter((f) => f.properties.risk_level === 'LOW').length || 0;

  return (
    <aside className="left-command-panel">
      <div className="left-panel-header">
        <div className="overview-title-row">
          <Activity size={16} className="text-cyan" />
          <span>Command Overview</span>
        </div>
        <button type="button" onClick={onClose} className="intel-close-btn" title={t('close')}>
          <X size={17} />
        </button>
      </div>

      <div className="left-panel-body">
        {/* Quick Stats Grid */}
        <div className="quick-stats-grid">
          <div className="quick-stat-box red">
            <span className="quick-stat-count">{criticalCount}</span>
            <span className="quick-stat-lbl">Critical Zones</span>
          </div>
          <div className="quick-stat-box amber">
            <span className="quick-stat-count">{highCount}</span>
            <span className="quick-stat-lbl">High Alerts</span>
          </div>
          <div className="quick-stat-box green">
            <span className="quick-stat-count">{lowCount}</span>
            <span className="quick-stat-lbl">Stable Zones</span>
          </div>
        </div>

        {/* Monitored District Feed */}
        <div className="districts-feed-card">
          <div className="feed-header">
            <span>{t('monitored_districts')}</span>
            <span className="feed-count">{zones?.features?.length || 0} Nodes</span>
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

        {/* Active Threat Matrix */}
        <div className="threat-matrix-section-left">
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
      </div>
    </aside>
  );
}
